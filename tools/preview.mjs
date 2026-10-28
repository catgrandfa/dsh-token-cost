/**
 * 面板预览生成器：把**真实的客户端 bundle** 在一个独立 HTML 页里渲染出来，
 * 用真实的本机聚合数据填充，方便截图评审 / 改 UI 时对照，不需要启动 DSH。
 *
 * 做法：不需要 React —— 页内用一个极小的 React 垫片（createElement/useState/useEffect…）
 * 把面板产出的元素树直接落成 DOM（面板全部用内联样式，所以视觉等价），
 * 再配合 DSH 的主题变量（--dsw-alias-*）模拟深浅色。
 *
 * 用法：
 *   node tools/preview.mjs                 # 生成 /tmp/dsh-panel-preview.html 并打印路径
 *   node tools/preview.mjs --open          # 生成后直接用默认浏览器打开
 *   node tools/preview.mjs --out x.html --width 1120
 *   node tools/preview.mjs --demo --view detail     # 合成数据（截图用，不含真实会话）
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..');
const argv = process.argv.slice(2);
const argOf = (flag, fallback) => {
  const i = argv.indexOf(flag);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};
const OUT = resolve(argOf('--out', '/tmp/dsh-panel-preview.html'));
const WIDTH = Number(argOf('--width', 1000));
/** 预览哪个视图：overview / detail / export（面板内部状态在垫片里强制初值） */
const VIEW = argOf('--view', 'overview');

/* ------------------------------------------------------------------ *
 * 演示数据：`--demo` 用合成数据渲染，公开仓库的截图/文档一律用它，
 * 避免把任何人的真实会话标题、工作区路径或余额带进图片。
 * ------------------------------------------------------------------ */
function demoData() {
  const now = Date.now();
  const cst = (ms) => new Date(ms + 8 * 3600e3);
  const keyOf = (ms) => cst(ms).toISOString().slice(0, 10);
  const todayKey = keyOf(now);
  const rates = {
    offPeak: {
      'deepseek-flash': { cacheHit: 0.02, cacheMiss: 1, output: 4 },
      'deepseek-v4-pro': { cacheHit: 0.15, cacheMiss: 4.5, output: 13.5 },
    },
    peak: {
      'deepseek-flash': { cacheHit: 0.04, cacheMiss: 2, output: 8 },
      'deepseek-v4-pro': { cacheHit: 0.3, cacheMiss: 9, output: 27 },
    },
  };
  const blank = () => ({
    miss: 0, hit: 0, out: 0, cacheWrite: 0, reasoning: 0, calls: 0, cny: 0,
    peakCalls: 0, unpricedCalls: 0, firstTime: null, lastTime: null,
    hitRate: null, byHour: new Array(24).fill(0),
    tier: { peak: { hit: 0, miss: 0, out: 0, cny: 0, calls: 0 }, offPeak: { hit: 0, miss: 0, out: 0, cny: 0, calls: 0 } },
  });
  const days = {};
  const dayModels = {};
  const sessions = {};
  const titles = [
    '导出面板：CSV / JSON 下载',
    '重构会话聚合与增量缓存',
    'fix: 多帧 zstd 边界扫描',
    '子代理：并行实现 CLI 报表',
    '预算告警与月度进度条',
    '排查时间窗口统计偏差',
    'docs: README 与截图更新',
    'provider 口径与计费路由',
  ];
  const totalCalls = 18;
  for (let i = 0; i < 365; i += 1) {
    const ms = now - i * 86400000;
    const key = keyOf(ms);
    const dow = cst(ms).getUTCDay();
    const weekend = dow === 0 || dow === 6;
    const weekdayScale = weekend ? 0.35 : 1;
    const wave = 0.75 + 0.35 * Math.sin(i / 3.1) + (i === 0 ? 0.2 : 0);
    const hit = Math.round(52_000_000 * weekdayScale * wave);
    const miss = Math.round(690_000 * weekdayScale * wave);
    const out = Math.round(310_000 * weekdayScale * wave);
    const cny = Number(((hit / 1e6) * 0.02 + (miss / 1e6) * 1 + (out / 1e6) * 4).toFixed(6));
    const calls = Math.max(1, Math.round(totalCalls * weekdayScale * wave));
    const entry = blank();
    entry.hit = hit; entry.miss = miss; entry.out = out; entry.calls = calls; entry.cny = cny;
    entry.firstTime = ms - 3 * 3600e3; entry.lastTime = ms - 1800e3;
    entry.hitRate = Number(((100 * hit) / (hit + miss)).toFixed(1));
    entry.peakCalls = weekend ? 0 : Math.round(calls * 0.6);
    const peakShare = weekend ? 0 : 0.6;
    const peakHit = Math.round(hit * peakShare), peakMiss = Math.round(miss * peakShare), peakOut = Math.round(out * peakShare);
    entry.tier.peak = {
      hit: peakHit, miss: peakMiss, out: peakOut,
      cny: Number(((peakHit / 1e6) * 0.04 + (peakMiss / 1e6) * 2 + (peakOut / 1e6) * 8).toFixed(6)),
      calls: Math.round(calls * peakShare),
    };
    entry.tier.offPeak = {
      hit: hit - peakHit, miss: miss - peakMiss, out: out - peakOut,
      cny: Number((cny - entry.tier.peak.cny).toFixed(6)), calls: calls - entry.tier.peak.calls,
    };
    for (let hour = 0; hour < 24; hour += 1) {
      entry.byHour[hour] = i === 0 ? Math.max(0, Math.round((hit + miss + out) / 24 * (0.2 + Math.abs(Math.sin((hour - 8) / 2.4))))) : 0;
    }
    days[key] = entry;
    for (const [model, share] of [['deepseek-flash', 0.82], ['deepseek-v4-pro', 0.18]]) {
      const h = Math.round(hit * share), m = Math.round(miss * share), o = Math.round(out * share);
      dayModels[`${key}|deepseek-account | ${model}`] = {
        miss: m, hit: h, out: o, calls: Math.round(calls * share),
        cny: Number(((h / 1e6) * 0.02 + (m / 1e6) * 1 + (o / 1e6) * 4).toFixed(6)),
        hitRate: Number(((100 * h) / (h + m)).toFixed(1)),
      };
    }
  }
  const models = {};
  for (const [key, value] of Object.entries(dayModels)) {
    const modelKey = key.slice(key.indexOf('|') + 1);
    const acc = models[modelKey] ?? { ...blank(), firstTime: value.calls, lastTime: 0 };
    acc.hit += value.hit; acc.miss += value.miss; acc.out += value.out;
    acc.calls += value.calls; acc.cny += value.cny;
    models[modelKey] = acc;
  }
  for (const [key, value] of Object.entries(models)) {
    value.cny = Number(value.cny.toFixed(6));
    value.hitRate = Number(((100 * value.hit) / (value.hit + value.miss)).toFixed(1));
    value.tier = undefined;
  }
  let sessMs = now - 2 * 3600e3;
  const workspaces = ['demo-workspace', 'demo-lab', 'side-project'];
  titles.forEach((title, i) => {
    const hit = Math.round(8_400_000 / (i + 1.6));
    const miss = Math.round(96_000 / (i + 1.2));
    const out = Math.round(52_000 / (i + 1.1));
    sessions[`demo-workspace/session-${i + 1}`] = {
      miss, hit, out, cacheWrite: 0, reasoning: 0, calls: Math.max(3, 60 - i * 6),
      cny: Number(((hit / 1e6) * 0.02 + (miss / 1e6) * 1 + (out / 1e6) * 4).toFixed(6)),
      peakCalls: 10, unpricedCalls: 0, firstTime: sessMs - 5 * 3600e3, lastTime: sessMs,
      hitRate: Number(((100 * hit) / (hit + miss)).toFixed(1)), byHour: new Array(24).fill(0),
      tier: undefined,
      id: `session-${i + 1}`, workspace: workspaces[i % workspaces.length], title,
      createdAt: sessMs - 6 * 3600e3, delegationDepth: i === 3 ? 1 : 0, isSubagent: i === 3,
      parentId: i === 3 ? 'session-1' : null, agentLabel: i === 3 ? 'report-agent' : null,
    };
    sessMs -= 3 * 3600e3;
  });
  // 官方用量接口只返回最近 30 天：演示数据也照实模拟，宽窗口（月/季/年）由本地 days 提供
  const officialDays = {};
  for (let i = 0; i < 30; i += 1) {
    const key = keyOf(now - i * 86400000);
    const value = days[key];
    if (!value) continue;
    officialDays[key] = { cny: value.cny, hit: value.hit, miss: value.miss, out: value.out, requests: value.calls };
  }
  return {
    summary: {
      generatedAt: now,
      sessionsRoot: '~/.dsh/sessions',
      filesScanned: 42, filesReused: 40, filesOutsideWindow: 3, filesSkippedAsStale: [],
      unreadableFiles: 0, newestSourceMtime: now - 1800e3, partialScan: false,
      calls: Object.values(days).reduce((sum, day) => sum + day.calls, 0),
      unpricedCalls: 0,
      days,
      sessions,
      models,
      dayModels,
      providers: {
        'deepseek-account': {
          calls: Object.values(days).reduce((sum, day) => sum + day.calls, 0),
          tokens: Object.values(days).reduce((sum, day) => sum + day.hit + day.miss + day.out, 0),
          cny: Number(Object.values(days).reduce((sum, day) => sum + day.cny, 0).toFixed(6)),
        },
      },
      today: todayKey,
      peakNow: true,
      pricing: { source: 'https://api-docs.deepseek.com/zh-cn/quick_start/pricing', fetchedAt: '2026-09-19' },
      elapsedMs: 168,
      official: {
        ok: true, auth: 'account', auto: true, source: 'platform.deepseek.com/api/v0/usage/by_api_key',
        todayKey, cny: days[todayKey].cny, yesterdayCny: days[keyOf(now - 86400000)]?.cny ?? 0,
        hit: days[todayKey].hit, miss: days[todayKey].miss, out: days[todayKey].out,
        requests: days[todayKey].calls, byHour: days[todayKey].byHour,
        days: officialDays, fetchedAt: now,
      },
      meterSource: 'official',
      billingUrl: 'https://platform.deepseek.com/usage',
      config: {
        dailyBudget: 50, monthlyBudget: 300, lowBalanceAlert: 20, alertAtPercent: 80,
        showBalance: true, showOfficial: true, refreshSeconds: 60, officialOnly: true,
        skin: 'glass', rates,
      },
      plugin: {
        name: 'dsh-token-cost', version: '0.2.0', license: 'MIT',
        repo: 'https://github.com/catgrandfa/dsh-token-cost', update: null,
      },
    },
    balance: {
      supported: true, ok: true, source: 'account', is_available: true,
      balance_infos: [{ currency: 'CNY', total_balance: '93.35', granted_balance: '2.06', topped_up_balance: '91.29' }],
      total_costs: [{ currency: 'CNY', amount: '38.66' }],
    },
  };
}


/** 取真实数据：用假 ctx 跑一遍宿主半侧的 /summary 与 /balance */
async function collectData() {
  // 累计消费走 get_user_summary —— 预览里别打真网络，给一个与本机余额同量级的假值
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    if (String(url).includes('/api/v0/users/get_user_summary')) {
      return { ok: true, status: 200, json: async () => ({ data: { biz_data: { total_costs: [{ currency: 'CNY', amount: '38.6617931000000000' }] } } }) };
    }
    throw new Error(`preview: unexpected fetch ${url}`);
  };
  const mod = await import(new URL('../lib/index.js', import.meta.url).href);
  const routes = [];
  const fakeSettings = {
    register: () => ({
      get: () => ({
        dailyBudget: 50, alertAtPercent: 80, showBalance: true, officialOnly: true,
        apiKeyEnv: 'DEEPSEEK_API_KEY', refreshSeconds: 60, scanBudgetMs: 8000, historyDays: 30,
        skin: 'glass', autoUpdate: false,
        offPeak: { 'deepseek-flash': { cacheHit: 0.02, cacheMiss: 1, output: 4 }, 'deepseek-v4-pro': { cacheHit: 0.15, cacheMiss: 4.5, output: 13.5 } },
        peak: { 'deepseek-flash': { cacheHit: 0.04, cacheMiss: 2, output: 8 }, 'deepseek-v4-pro': { cacheHit: 0.3, cacheMiss: 9, output: 27 } },
      }),
      watch: () => () => {},
      update() {}, replace() {},
    }),
  };
  const ctx = {
    settings: fakeSettings,
    // 账号服务：用本机实测到的真实余额，让预览里的余额块是有数的
    deepseekAccount: {
      async getBalance() {
        return { status: 'ready', value: [{ currency: 'CNY', balance: '91.2898273800000000' }], bonusWallets: [{ currency: 'CNY', balance: '2.0588434400000000' }] };
      },
      async getPlatformSession() {
        return { origin: 'https://platform.deepseek.com', token: 'preview-session', requestHeaders: {} };
      },
    },
    webServer: { register: (spec) => { routes.push(spec); return () => {}; } },
    get(name) { return name === 'deepseekAccount' ? ctx.deepseekAccount : undefined; },
    logger: Object.assign(() => ({ info() {}, warn() {}, error() {}, debug() {} }), { info() {}, warn() {}, error() {}, debug() {} }),
    inject(names, cb) { const s = Object.create(this); s.effect = (fn) => { fn(); return { dispose() {} }; }; cb(s); return { dispose() {} }; },
    effect(cb) { cb(); return { dispose() {} }; },
  };
  await mod.apply(ctx, {});
  await new Promise((r) => setTimeout(r, 80));
  const call = async (path, url) => {
    const route = routes.find((r) => r.path.endsWith(path));
    let body = '';
    await route.handler({ method: 'GET', url }, { writeHead: () => {}, end: (b) => { body = b; } });
    return JSON.parse(body)?.data;
  };
  const summary = await call('/summary', '/token-cost/summary?refresh=1');
  const balance = await call('/balance', '/token-cost/balance?refresh=1&locale=zh-CN');
  globalThis.fetch = realFetch;
  return { summary, balance };
}

const { summary, balance } = argv.includes('--demo') ? demoData() : await collectData();
const bundle = readFileSync(join(REPO, 'lib', 'client.js'), 'utf8');

const html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><title>DSH Token 面板预览</title>
<style>
  :root {
    --dsw-alias-label-primary: #e6e9ef;
    --dsw-alias-label-secondary: #a9b1c1;
    --dsw-alias-label-tertiary: #7c8598;
    --dsw-alias-border-l1: rgba(255,255,255,.10);
    --dsw-alias-border-l2: rgba(255,255,255,.18);
    --dsw-alias-bg-layer-1: rgba(255,255,255,.045);
    --dsw-alias-bg-layer-2: rgba(47,125,255,.10);
    --dsw-alias-brand-primary: #2f7dff;
    --dsw-alias-state-success-primary: #3fb950;
    --dsw-alias-state-warn-primary: #e3b341;
    --dsw-alias-state-error-primary: #f85149;
    --dsw-alias-interactive-bg-hover: rgba(255,255,255,.08);
  }
  html, body { margin: 0; background: #0b0f19; color: #e6e9ef;
    font: 13px/1.5 -apple-system, "SF Pro Text", "PingFang SC", "Microsoft YaHei", sans-serif; }
  #stage { width: ${WIDTH}px; margin: 24px auto 40px; }
</style></head>
<body>
<div id="stage"></div>
<script>
// ---- 极小 React 垫片：面板只用 createElement / useState / useEffect / useRef / useMemo / useCallback ----
const React = {
  createElement(type, props, ...children) {
    return { type, props: props || {}, children: children.flat(Infinity).filter((c) => c !== null && c !== undefined && c !== false) };
  },
  // 预览用：数据类状态（形如 {status, data}）直接换成真实 payload，其余原样；
  // 这样不需要真的跑 React 更新，就能把「有数据」的样子渲染出来。
  useState(init) {
    // 视图切换：面板第一个字符串状态就是 view（初值 'overview'），预览时强制成目标视图
    if (init === 'overview') return [${JSON.stringify(VIEW)}, () => {}];
    const value = typeof init === 'function' ? init() : init;
    if (value && typeof value === 'object' && 'status' in value && 'data' in value) {
      const summaryLike = value.status === 'loading' || value.status === 'failed';
      return [summaryLike
        ? { status: 'ready', data: DATA.summary, error: null, at: Date.now(), refresh: () => {} }
        : { status: 'ready', data: DATA.balance, reload: () => {} }, () => {}];
    }
    return [value, () => {}];
  },
  useEffect() {}, useLayoutEffect() {},
  useRef(v) { return { current: v }; },
  useMemo(fn) { return fn(); },
  useCallback(fn) { return fn; },
  Fragment: 'fragment',
};
function render(node, parent) {
  if (node === null || node === undefined || node === false) return;
  if (Array.isArray(node)) { node.forEach((n) => render(n, parent)); return; }
  if (typeof node === 'string' || typeof node === 'number') { parent.appendChild(document.createTextNode(String(node))); return; }
  const { type, props, children } = node;
  // 函数组件在 React 里通过 props.children 拿到子元素；垫片也补上，否则 <SectionTitle>text</SectionTitle> 会丢文案
  if (typeof type === 'function') { render(type({ ...props, children }), parent); return; }
  const el = document.createElement(type === 'fragment' ? 'div' : type);
  for (const [k, v] of Object.entries(props || {})) {
    if (k === 'children' || v === null || v === undefined) continue;
    if (k === 'style' && typeof v === 'object') {
      // React 会给数值型样式自动补 px；预览垫片同样处理，否则 width:78 这类样式会被浏览器忽略
      const UNITLESS = new Set(['flex', 'flexGrow', 'flexShrink', 'opacity', 'zIndex', 'fontWeight', 'lineHeight', 'order', 'zoom', 'tabSize']);
      for (const [sk, sv] of Object.entries(v)) {
        if (sv === null || sv === undefined) continue;
        el.style[sk] = typeof sv === 'number' && !UNITLESS.has(sk) ? String(sv) + 'px' : sv;
      }
    }
    else if (k === 'className') el.className = v;
    else if (k === 'key' || k === 'title') { if (k === 'title') el.title = v; }
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (typeof v === 'boolean') { if (v) el.setAttribute(k, ''); }
    else el.setAttribute(k, v);
  }
  render(children, el);
  parent.appendChild(el);
}

// ---- DSH 模块加载器 + 假 ctx ----
const DATA = ${JSON.stringify({ summary, balance })};
let panelComponent = null;
let DICTS = { zh: {}, en: {} };
window.__ModuleLoader__ = { load(entry) { const mod = entry.factory((n) => (n === 'react' ? React : {})); mod.apply({
  slots: {
    inject: (key, cb) => cb(),
    register: (spec, component) => { if (spec.name === 'main') panelComponent = component; return () => {}; },
  },
  locale: { register: (ns, dict) => { DICTS = dict; return () => {}; } },
  effect: (cb) => { cb(); return () => {}; },
}); } };
</script>
<script>${bundle}</script>
<script>
const t = (k) => DICTS.zh[k] ?? k;
render(panelComponent({ t, useProjection: undefined }), document.getElementById('stage'));
</script>
</body></html>
`;

writeFileSync(OUT, html);
console.log(`preview written: ${OUT}`);
console.log(`  summary: ${summary?.calls ?? 0} calls / ¥${summary?.days?.[summary.today]?.cny ?? 0} today · balance ok=${Boolean(balance?.ok)}`);
if (!process.env.DSH_PREVIEW_NO_EXIT) setTimeout(() => process.exit(0), 50);
if (argv.includes('--open')) {
  const { execFileSync } = await import('node:child_process');
  execFileSync('open', [OUT]);
  console.log('opened in the default browser');
}
