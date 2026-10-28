#!/usr/bin/env node
/**
 * 自检：tools/report.mjs 的冒烟测试。
 * 在系统临时目录造一个最小会话日志，验证 JSON / CSV / --help / 错误退出，
 * 结束后清理临时目录。不读写真实 ~/.dsh，也不依赖本机绝对路径。
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPORT = fileURLToPath(new URL('./report.mjs', import.meta.url));
const FIXED_DAY = '2026-09-21';
// core 的日志时间字段是 epoch 毫秒；用固定 ISO 换算，保证任何机器/时区下结果一致。
const FIXED_SESSION_MS = Date.parse('2026-09-21T02:00:00.000Z'); // 北京时间周一 10:00（高峰）
const FIXED_CALL_MS = Date.parse('2026-09-21T02:00:05.000Z');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function run(args) {
  return execFileSync(process.execPath, [REPORT, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
}

let tmp;
try {
  tmp = mkdtempSync(join(tmpdir(), 'dsh-token-cost-report-'));
  const sessionDir = join(tmp, 'ws1', 'sess-1');
  mkdirSync(sessionDir, { recursive: true });
  const records = [
    {
      type: 'session',
      id: 'sess-1',
      createdAt: FIXED_SESSION_MS,
      delegationDepth: 0,
    },
    {
      type: 'assistant/message',
      time: FIXED_CALL_MS,
      data: {
        usage: { inputTokens: 1_000_000, cacheReadTokens: 0, outputTokens: 100_000 },
        message: {
          source: { provider: 'deepseek-account', model: 'deepseek-flash' },
        },
      },
    },
    {
      // 第三方路由（pi-ai）使用 GLM：默认应计入并按 GLM 内置价折算
      type: 'assistant/message',
      time: FIXED_CALL_MS + 5_000,
      data: {
        usage: { inputTokens: 1_000_000, cacheReadTokens: 0, outputTokens: 100_000 },
        message: {
          source: { provider: 'pi-ai', model: 'glm-5.3' },
        },
      },
    },
  ];
  writeFileSync(
    join(sessionDir, 'session.jsonl'),
    `${records.map((record) => JSON.stringify(record)).join('\n')}\n`,
    'utf8',
  );

  /* ------------------------------ --json ------------------------------ */
  const rawJson = run(['--json', '--sessions-root', tmp]);
  let json;
  try {
    json = JSON.parse(rawJson);
  } catch (error) {
    throw new Error(`--json 输出不是合法 JSON：${error.message}`);
  }
  assert(json.calls === 2, `calls 应为 2，实际 ${json.calls}`);
  assert(Object.keys(json.sessions).length === 1, `sessions 应为 1 条，实际 ${Object.keys(json.sessions).length}`);
  const day = json.days[FIXED_DAY];
  assert(day && day.calls === 2, `days['${FIXED_DAY}'] 应有 2 次调用`);
  assert(day.cny > 0, `days['${FIXED_DAY}'].cny 应 > 0，实际 ${day.cny}`);
  const glm = json.models['pi-ai | glm-5.3'];
  assert(glm && glm.cny > 0, '第三方 GLM 模型应按内置单价计价');
  assert(json.providers['pi-ai'] && json.providers['pi-ai'].cny > 0, 'providers 应包含 pi-ai 且金额 > 0');
  assert(json.windows && typeof json.windows.today.cny === 'number', 'windows.today.cny 应为数字');
  assert(json.budget && json.budget.daily === null && json.budget.over === false, '未给 --budget 时预算应为空且未超支');
  const officialOnly = JSON.parse(run(['--json', '--official-only', '--sessions-root', tmp]));
  assert(officialOnly.calls === 1 && !officialOnly.models['pi-ai | glm-5.3'], '--official-only 应排除第三方 provider');
  console.log(`ok json: calls=2（含 GLM 第三方） sessions=1 ${FIXED_DAY} cny=${day.cny}`);

  /* ------------------------------ --csv daily ------------------------------ */
  const csvDays = 3650;
  const csv = run(['--csv', 'daily', '--days', String(csvDays), '--sessions-root', tmp]);
  const lines = csv.replace(/\r\n/g, '\n').trimEnd().split('\n');
  assert(lines[0] === 'date,cny,hit,miss,out,calls,hitRate', `daily 表头不符：${lines[0]}`);
  assert(lines.length === csvDays + 1, `daily 行数应为 ${csvDays + 1}，实际 ${lines.length}`);
  const fixedRow = lines.find((line) => line.startsWith(`${FIXED_DAY},`));
  assert(fixedRow, `daily CSV 缺少 ${FIXED_DAY} 行`);
  assert(Number(fixedRow.split(',')[1]) > 0, `daily CSV ${FIXED_DAY} 的 cny 应 > 0`);
  console.log(`ok csv daily: header + ${csvDays} 行，固定日期 cny>0`);

  /* ------------------------------ --help ------------------------------ */
  let help = '';
  try {
    help = run(['--help']);
  } catch (error) {
    throw new Error(`--help 应以 0 退出（实际 ${error.status}）`);
  }
  assert(help.includes('用法'), '--help 输出应包含“用法”');
  console.log('ok help: exit 0');

  /* ------------------------------ 错误参数 ------------------------------ */
  let failure = null;
  try {
    run(['--csv', 'nope', '--sessions-root', tmp]);
  } catch (error) {
    failure = error;
  }
  assert(failure, '无效 --csv 应失败退出');
  assert(failure.status === 1, `无效 --csv 应 exit 1，实际 ${failure.status}`);
  assert(String(failure.stderr).includes('错误'), '无效参数应在 stderr 给出中文错误');
  console.log('ok error: 无效 --csv exit 1');

  console.log('REPORT SMOKE OK');
} catch (error) {
  console.error(`FAIL: ${error?.message || error}`);
  process.exitCode = 1;
} finally {
  if (tmp) {
    try {
      rmSync(tmp, { recursive: true, force: true });
    } catch {
      /* 清理失败不影响自检结论 */
    }
  }
}
