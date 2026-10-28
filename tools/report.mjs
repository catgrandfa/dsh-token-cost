#!/usr/bin/env node
/**
 * dsh-token-cost 的独立 CLI 报表（零依赖，只用 node: 内置模块）。
 *
 * 数据直接复用 src/core.mjs 的 aggregate()：按北京时间分桶、按官方费率估算，
 * 因此报表与插件面板的数字同源。金额只用于本机自查，不可用于对账。
 *
 * 用法：node tools/report.mjs [--days N] [--top N] [--json]
 *                              [--csv daily|sessions|models] [--budget N]
 *                              [--sessions-root PATH] [--help]
 */
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  aggregate, dayKeyOf, toCst, OFFICIAL_PROVIDERS, PRICING_FETCHED_AT,
} from '../src/core.mjs';
import { sessionsRoot as defaultSessionsRoot } from './paths.mjs';

const DEFAULT_DAYS = 7;
const DEFAULT_TOP = 10;
const MAX_DAYS = 3660;
const MAX_TOP = 10000;
const CSV_DATASETS = ['daily', 'sessions', 'models'];

const HELP = `dsh-token-cost CLI 报表（北京时间 UTC+8）

用法：
  node tools/report.mjs [选项]

选项：
  --days N              报表窗口天数（默认 ${DEFAULT_DAYS}，取值 1-${MAX_DAYS}）
  --top N               模型 / 会话表格最多显示条数（默认 ${DEFAULT_TOP}）
  --json                把聚合结果输出为 JSON（stdout 只有 JSON）
  --csv <dataset>       输出 CSV：daily | sessions | models
  --budget N            今日预算（CNY），显示使用率与是否超支
  --sessions-root PATH  会话日志根目录（默认 DSH_SESSIONS / DSH_HOME/sessions / ~/.dsh/sessions）
  --help, -h            显示本帮助并退出

示例：
  node tools/report.mjs --days 3 --top 5
  node tools/report.mjs --json > report.json
  node tools/report.mjs --csv daily > daily.csv
  node tools/report.mjs --budget 5

口径：金额为本机按 DeepSeek 官方费率估算，不用于对账；未知模型只记 token 不计费。`;

class CliError extends Error {}

function die(message) {
  throw new CliError(message);
}

function parseInteger(name, raw, min, max) {
  if (!/^\d+$/.test(String(raw))) {
    die(`参数 ${name} 需要 ${min}-${max} 的整数，收到：${raw}`);
  }
  const n = Number(raw);
  if (!Number.isSafeInteger(n) || n < min || n > max) {
    die(`参数 ${name} 需要 ${min}-${max} 的整数，收到：${raw}`);
  }
  return n;
}

function parseBudget(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) {
    die(`参数 --budget 需要大于 0 的金额（CNY），收到：${raw}`);
  }
  return n;
}

function parseDataset(raw) {
  if (!CSV_DATASETS.includes(raw)) {
    die(`参数 --csv 只接受 ${CSV_DATASETS.join(' / ')}，收到：${raw}`);
  }
  return raw;
}

function parseArgs(argv) {
  const opts = {
    days: DEFAULT_DAYS,
    top: DEFAULT_TOP,
    json: false,
    csv: null,
    budget: null,
    sessionsRoot: null,
    help: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg !== '-h' && !arg.startsWith('--')) {
      die(`无法识别的参数：${arg}（用 --help 查看用法）`);
    }
    let name = arg;
    let inline;
    if (name.startsWith('--')) {
      const eq = name.indexOf('=');
      if (eq >= 0) {
        inline = name.slice(eq + 1);
        name = name.slice(0, eq);
      }
    }
    const takeValue = () => {
      if (inline !== undefined) return inline;
      if (i + 1 >= argv.length) die(`参数 ${name} 缺少取值`);
      i += 1;
      return argv[i];
    };
    const rejectValue = () => {
      if (inline !== undefined) die(`参数 ${name} 不接受取值`);
    };
    switch (name) {
      case '-h':
      case '--help':
        rejectValue();
        opts.help = true;
        break;
      case '--json':
        rejectValue();
        opts.json = true;
        break;
      case '--days':
        opts.days = parseInteger('--days', takeValue(), 1, MAX_DAYS);
        break;
      case '--top':
        opts.top = parseInteger('--top', takeValue(), 1, MAX_TOP);
        break;
      case '--budget':
        opts.budget = parseBudget(takeValue());
        break;
      case '--csv':
        opts.csv = parseDataset(takeValue());
        break;
      case '--sessions-root': {
        const value = takeValue();
        if (!value) die('参数 --sessions-root 需要一个目录路径');
        opts.sessionsRoot = value;
        break;
      }
      default:
        die(`未知参数：${name}（用 --help 查看用法）`);
    }
  }
  if (opts.json && opts.csv) die('--json 与 --csv 不能同时使用');
  return opts;
}

/* ------------------------------------------------------------------ *
 * 数字 / 时间 / 文本宽度格式化（中文表格按显示宽度对齐）
 * ------------------------------------------------------------------ */
const round6 = (n) => Number(n.toFixed(6));
const fmtCny = (n) => (Number.isFinite(n) ? n : 0).toFixed(4);
const fmtRate = (rate) => (rate == null ? '-' : `${rate.toFixed(1)}%`);
const fmtInt = (n) => String(Math.trunc(Number(n) || 0));
const fmtGroup = (n) => fmtInt(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const rateOf = (hit, miss) => (hit + miss > 0 ? Number(((100 * hit) / (hit + miss)).toFixed(1)) : null);

/** 时间戳 → 北京时间 'YYYY-MM-DD HH:mm[:ss]'（与 core 的 toCst 同口径）。 */
function fmtCst(ms, withSeconds = false) {
  if (!Number.isFinite(ms)) return '-';
  const iso = toCst(ms).toISOString();
  return `${iso.slice(0, 10)} ${iso.slice(11, withSeconds ? 19 : 16)}`;
}

function charWidth(ch) {
  const cp = ch.codePointAt(0);
  if (cp === 0) return 0;
  if (cp < 32 || (cp >= 0x7f && cp < 0xa0)) return 0;
  if (
    (cp >= 0x0300 && cp <= 0x036f) // combining marks
    || (cp >= 0x1ab0 && cp <= 0x1aff)
    || (cp >= 0x1dc0 && cp <= 0x1dff)
    || (cp >= 0x20d0 && cp <= 0x20ff)
    || (cp >= 0xfe20 && cp <= 0xfe2f)
  ) return 0;
  if (
    (cp >= 0x1100 && cp <= 0x115f) // Hangul Jamo
    || (cp >= 0x2329 && cp <= 0x232a)
    || (cp >= 0x2e80 && cp <= 0xa4cf) // CJK / 假名 / 注音等
    || (cp >= 0xac00 && cp <= 0xd7a3) // Hangul
    || (cp >= 0xf900 && cp <= 0xfaff)
    || (cp >= 0xfe10 && cp <= 0xfe19)
    || (cp >= 0xfe30 && cp <= 0xfe6f)
    || (cp >= 0xff00 && cp <= 0xff60) // 全角
    || (cp >= 0xffe0 && cp <= 0xffe6)
    || (cp >= 0x1f300 && cp <= 0x1f64f) // emoji
    || (cp >= 0x1f680 && cp <= 0x1f6ff)
    || (cp >= 0x1f900 && cp <= 0x1f9ff)
    || (cp >= 0x20000 && cp <= 0x3fffd)
  ) return 2;
  return 1;
}

function displayWidth(text) {
  let width = 0;
  for (const ch of String(text)) width += charWidth(ch);
  return width;
}

function pad(text, width, align = 'left') {
  const s = String(text);
  const gap = Math.max(0, width - displayWidth(s));
  return align === 'right' ? `${' '.repeat(gap)}${s}` : `${s}${' '.repeat(gap)}`;
}

function truncate(text, maxWidth) {
  const s = String(text ?? '');
  if (displayWidth(s) <= maxWidth) return s;
  let out = '';
  let width = 0;
  for (const ch of s) {
    const w = charWidth(ch);
    if (width + w > Math.max(1, maxWidth - 1)) break;
    out += ch;
    width += w;
  }
  return `${out}…`;
}

/** 中间省略：保留头尾，适合 DSH 那种「前缀相同、结尾才是仓库名」的工作区目录。 */
function truncateMiddle(text, maxWidth) {
  const s = String(text ?? '');
  if (displayWidth(s) <= maxWidth) return s;
  const budget = Math.max(1, maxWidth - 1);
  const headBudget = Math.ceil(budget / 2);
  const tailBudget = budget - headBudget;
  const chars = [...s];
  let head = '';
  let headWidth = 0;
  for (const ch of chars) {
    const w = charWidth(ch);
    if (headWidth + w > headBudget) break;
    head += ch;
    headWidth += w;
  }
  let tail = '';
  let tailWidth = 0;
  for (let i = chars.length - 1; i >= 0; i -= 1) {
    const w = charWidth(chars[i]);
    if (tailWidth + w > tailBudget) break;
    tail = chars[i] + tail;
    tailWidth += w;
  }
  return `${head}…${tail}`;
}

function renderTable(headers, rows, aligns) {
  const body = rows.length > 0 ? rows : [headers.map((_, i) => (i === 0 ? '（无数据）' : ''))];
  const widths = headers.map((h, i) => Math.max(displayWidth(h), ...body.map((r) => displayWidth(r[i] ?? ''))));
  const line = (cells) => cells.map((c, i) => pad(c, widths[i], aligns[i])).join('  ');
  return [
    line(headers),
    widths.map((w) => '─'.repeat(w)).join('  '),
    ...body.map(line),
  ].join('\n');
}

/* ------------------------------------------------------------------ *
 * CSV（RFC4180：含逗号 / 引号 / 换行的字段加双引号，内部引号翻倍）
 * ------------------------------------------------------------------ */
function csvCell(value) {
  const s = value == null ? '' : String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(headers, rows) {
  return `${[headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\n')}\n`;
}

/* ------------------------------------------------------------------ *
 * 主流程
 * ------------------------------------------------------------------ */
function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    process.stdout.write(`${HELP}\n`);
    return;
  }

  const root = resolve(opts.sessionsRoot ?? defaultSessionsRoot());
  if (!existsSync(root)) {
    die(`会话根目录不存在：${root}\n请用 --sessions-root 指定，或设置 DSH_SESSIONS / DSH_HOME。`);
  }
  let stat;
  try {
    stat = statSync(root);
  } catch (error) {
    die(`无法访问会话根目录：${root}（${error.code || error.message}）`);
  }
  if (!stat.isDirectory()) die(`会话根目录不是目录：${root}`);

  const data = aggregate(root);
  const now = data.generatedAt;
  const todayKey = dayKeyOf(now);
  const windowKeys = [];
  for (let i = opts.days - 1; i >= 0; i -= 1) windowKeys.push(dayKeyOf(now - i * 86400000));

  const emptyTotals = () => ({ calls: 0, hit: 0, miss: 0, out: 0, cny: 0, unpricedCalls: 0 });
  const totalsFor = (keys) => {
    const total = emptyTotals();
    for (const key of keys) {
      const day = data.days[key];
      if (!day) continue;
      total.calls += day.calls;
      total.hit += day.hit;
      total.miss += day.miss;
      total.out += day.out;
      total.cny += day.cny;
      total.unpricedCalls += day.unpricedCalls;
    }
    return { ...total, cny: round6(total.cny), hitRate: rateOf(total.hit, total.miss) };
  };

  const monthPrefix = todayKey.slice(0, 7);
  const monthKeys = Object.keys(data.days).filter((key) => key.startsWith(monthPrefix)).sort();
  const todayTotals = totalsFor([todayKey]);
  const lastNTotals = totalsFor(windowKeys);
  const monthTotals = totalsFor(monthKeys);
  const windows = {
    today: { date: todayKey, ...todayTotals },
    lastNDays: { days: opts.days, from: windowKeys[0], to: todayKey, ...lastNTotals },
    month: { month: monthPrefix, ...monthTotals },
  };
  const budget = {
    daily: opts.budget,
    used: todayTotals.cny,
    remaining: opts.budget == null ? null : round6(opts.budget - todayTotals.cny),
    over: opts.budget == null ? false : todayTotals.cny > opts.budget,
  };

  if (opts.json) {
    const payload = {
      generatedAt: data.generatedAt,
      sessionsRoot: root,
      calls: data.calls,
      unpricedCalls: data.unpricedCalls,
      filesScanned: data.filesScanned,
      days: data.days,
      models: data.models,
      providers: data.providers,
      sessions: data.sessions,
      windows,
      budget,
    };
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
    return;
  }

  if (opts.csv) {
    if (opts.csv === 'daily') {
      const rows = windowKeys.map((key) => {
        const day = data.days[key];
        return [key, day?.cny ?? 0, day?.hit ?? 0, day?.miss ?? 0, day?.out ?? 0, day?.calls ?? 0, day?.hitRate ?? ''];
      });
      process.stdout.write(toCsv(['date', 'cny', 'hit', 'miss', 'out', 'calls', 'hitRate'], rows));
      return;
    }
    if (opts.csv === 'sessions') {
      const rows = Object.entries(data.sessions)
        .filter(([, session]) => session.calls > 0)
        .sort((a, b) => b[1].cny - a[1].cny || b[1].calls - a[1].calls)
        .map(([key, session]) => [
          session.id || key.slice(key.indexOf('/') + 1),
          String(session.title ?? '').replace(/\s+/g, ' ').trim(),
          session.workspace ?? '',
          session.isSubagent ? 'true' : 'false',
          session.lastTime == null ? '' : fmtCst(session.lastTime, true),
          session.calls,
          session.hit,
          session.miss,
          session.out,
          session.cny,
        ]);
      process.stdout.write(toCsv(['id', 'title', 'workspace', 'isSubagent', 'lastTime', 'calls', 'hit', 'miss', 'out', 'cny'], rows));
      return;
    }
    const rows = Object.entries(data.models)
      .sort((a, b) => b[1].cny - a[1].cny || b[1].calls - a[1].calls || a[0].localeCompare(b[0]))
      .map(([key, model]) => [key, model.calls, model.hit, model.miss, model.out, model.cny]);
    process.stdout.write(toCsv(['key', 'calls', 'hit', 'miss', 'out', 'cny'], rows));
    return;
  }

  /* ------------------------------ 人类可读报表 ------------------------------ */
  const overall = Object.values(data.days).reduce(
    (sum, day) => ({ hit: sum.hit + day.hit, miss: sum.miss + day.miss }),
    { hit: 0, miss: 0 },
  );
  const out = [];
  const labelWidth = 18;
  const summaryLine = (label, value) => `${pad(label, labelWidth)} ${value}`;

  out.push('dsh-token-cost CLI 报表（北京时间 UTC+8）');
  out.push(`会话根目录：${root}`);
  out.push(`生成时间：${fmtCst(now)}`);
  out.push('');
  out.push(summaryLine('今日消费', `¥ ${fmtCny(todayTotals.cny)}`));
  out.push(summaryLine(`近 ${opts.days} 天消费`, `¥ ${fmtCny(lastNTotals.cny)}`));
  out.push(summaryLine('本月消费', `¥ ${fmtCny(monthTotals.cny)}`));
  out.push(summaryLine('调用次数（累计）', fmtGroup(data.calls)));
  out.push(summaryLine('缓存命中率（累计）', fmtRate(rateOf(overall.hit, overall.miss))));
  out.push(summaryLine('未定价调用（累计）', fmtGroup(data.unpricedCalls)));
  if (opts.budget != null) {
    const percent = (todayTotals.cny / opts.budget) * 100;
    const rest = opts.budget - todayTotals.cny;
    const tail = budget.over ? `超支 ¥ ${fmtCny(-rest)}` : `剩余 ¥ ${fmtCny(rest)}，未超支`;
    out.push(summaryLine('今日预算', `¥ ${fmtCny(opts.budget)}（已用 ${percent.toFixed(1)}%，${tail}）`));
  }

  out.push('');
  out.push(`每日消费（最近 ${opts.days} 天）`);
  const dailyRows = [...windowKeys].reverse().map((key) => {
    const day = data.days[key];
    return [
      key,
      fmtCny(day?.cny ?? 0),
      fmtGroup(day?.hit ?? 0),
      fmtGroup(day?.miss ?? 0),
      fmtGroup(day?.out ?? 0),
      fmtGroup(day?.calls ?? 0),
      fmtRate(day?.hitRate ?? null),
    ];
  });
  out.push(renderTable(
    ['日期', '消费 CNY', '命中', '未命中', '输出', '调用', '命中率'],
    dailyRows,
    ['left', 'right', 'right', 'right', 'right', 'right', 'right'],
  ));

  out.push('');
  out.push(`按模型（消费降序，Top ${opts.top}）`);
  const modelTotalCny = Object.values(data.models).reduce((sum, model) => sum + model.cny, 0);
  const modelRows = Object.entries(data.models)
    .map(([key, model]) => {
      const at = key.lastIndexOf(' | ');
      return {
        key,
        provider: at >= 0 ? key.slice(0, at) : 'unknown',
        model: at >= 0 ? key.slice(at + 3) : key,
        data: model,
      };
    })
    .sort((a, b) => b.data.cny - a.data.cny || b.data.calls - a.data.calls || a.key.localeCompare(b.key))
    .slice(0, opts.top)
    .map(({ provider, model, data: usage }) => [
      provider,
      model,
      fmtGroup(usage.calls),
      fmtGroup(usage.hit + usage.miss + usage.out),
      fmtCny(usage.cny),
      modelTotalCny > 0 ? `${((100 * usage.cny) / modelTotalCny).toFixed(1)}%` : '-',
    ]);
  out.push(renderTable(
    ['provider', 'model', '调用', 'token', '消费 CNY', '占比'],
    modelRows,
    ['left', 'left', 'right', 'right', 'right', 'right'],
  ));

  out.push('');
  out.push(`按会话（消费降序，Top ${opts.top}）`);
  const sessionRows = Object.entries(data.sessions)
    .map(([key, session]) => ({ key, session }))
    .filter(({ session }) => session.calls > 0)
    .sort((a, b) => b.session.cny - a.session.cny
      || b.session.calls - a.session.calls
      || (b.session.lastTime ?? 0) - (a.session.lastTime ?? 0))
    .slice(0, opts.top)
    .map(({ key, session }) => {
      const fallback = session.id || key.slice(key.indexOf('/') + 1);
      const title = String(session.title ?? '').replace(/\s+/g, ' ').trim() || fallback;
      return [
        truncate(title, 36),
        truncateMiddle(session.workspace ?? '-', 26),
        session.lastTime == null ? '-' : fmtCst(session.lastTime),
        fmtGroup(session.hit + session.miss + session.out),
        fmtGroup(session.calls),
        fmtCny(session.cny),
        session.isSubagent ? '是' : '否',
      ];
    });
  out.push(renderTable(
    ['标题 / ID', '工作区', '最近调用时间', 'token', '调用', '消费 CNY', '是否子代理'],
    sessionRows,
    ['left', 'left', 'left', 'right', 'right', 'right', 'left'],
  ));

  out.push('');
  out.push(`口径说明：金额为本机按 DeepSeek 官方费率（${PRICING_FETCHED_AT}）估算，不用于对账；`);
  out.push(`          未知模型只记 token 不计费；仅统计官方 provider（${OFFICIAL_PROVIDERS.join(' / ')}）。`);
  out.push('          缓存命中率 = 命中 token /（命中 + 未命中 token）。');
  process.stdout.write(`${out.join('\n')}\n`);
}

try {
  main();
} catch (error) {
  if (error instanceof CliError) {
    console.error(`错误：${error.message}`);
    process.exitCode = 1;
  } else {
    throw error;
  }
}
