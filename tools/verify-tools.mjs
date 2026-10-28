/**
 * 自检：工具调用（Search）单独计费。
 *
 * 背景：官方从 2026-11-01 00:00（北京）起对 Search / Fetch 按成功请求收费
 * （5 元 / 1,000 次）。本地日志只有 web_search / web_fetch **工具调用** 记录，
 * 所以面板按「成功的 web_search 调用次数 × 5 元/千次」估算，且 11/1 之前免费。
 * 这个用例守住四件事：
 *   1. web_search 成功调用计入当天；
 *   2. 11/1 之前计 0 元、11/1 起按 0.005 元/次；
 *   3. 失败（isError）的调用不计费；
 *   4. web_fetch（默认本地 HTTP 抓取）不算 Search 费用。
 */
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { aggregate, SEARCH_BILLING_FROM, SEARCH_CALL_PRICE } from '../src/core.mjs';

const root = mkdtempSync(join(tmpdir(), 'dsh-token-cost-tools-'));
let bad = 0;
const check = (name, ok, detail) => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok || detail === undefined ? '' : ` -> ${detail}`}`);
  if (!ok) bad += 1;
};

try {
  const dir = join(root, 'demo-ws', 'sess-1');
  mkdirSync(dir, { recursive: true });
  const at = (iso) => Date.parse(iso);
  const rec = (type, time, data) => JSON.stringify({ type, time, data });
  const call = (time, callId, name) => rec('tool/call', time, { turn: 1, step: 1, callId, name, arguments: {} });
  const result = (time, callId, isError = false) => rec('tool/result', time, {
    turn: 1, step: 1,
    message: { role: 'tool', toolCallId: callId, isError, content: [] },
    meta: {},
  });
  const freeAt = at('2026-10-20T02:00:00Z'); // 北京 10-20 10:00（免费期）
  const billedAt = at('2026-11-02T02:00:00Z'); // 北京 11-02 10:00（计费期）
  const lines = [
    rec('session', freeAt, {}),
    // 一条正常 token 用量，顺带确认聚合没被工具记录影响
    rec('assistant/message', freeAt, {
      usage: { inputTokens: 1000, outputTokens: 100, cacheReadTokens: 0, cacheWriteTokens: 0 },
      message: { source: { provider: 'deepseek-account', model: 'deepseek-flash' } },
    }),
    // 1) 免费期成功搜索
    call(freeAt, 'c1', 'web_search'),
    result(freeAt + 500, 'c1'),
    // 2) 计费期成功搜索
    call(billedAt, 'c2', 'web_search'),
    result(billedAt + 500, 'c2'),
    // 3) 计费期失败搜索：不计费
    call(billedAt + 1000, 'c3', 'web_search'),
    result(billedAt + 1500, 'c3', true),
    // 4) web_fetch 成功：不算 Search
    call(billedAt + 2000, 'c4', 'web_fetch'),
    result(billedAt + 2500, 'c4'),
    // 5) 没有结果的搜索（中断）：不计费
    call(billedAt + 3000, 'c5', 'web_search'),
    // 6) 计费期成功搜索（用 data.toolCallId 的另一种结果形态）
    call(billedAt + 4000, 'c6', 'web_search'),
    rec('tool/result', billedAt + 4500, { toolCallId: 'c6', isError: false }),
  ];
  writeFileSync(join(dir, 'session.v4.jsonl'), `${lines.join('\n')}\n`);

  const data = aggregate(root);
  const free = data.daysSearch?.['2026-10-20'];
  const billed = data.daysSearch?.['2026-11-02'];
  check('免费期成功搜索计入当天（calls=1）', free?.calls === 1, JSON.stringify(free));
  check('免费期搜索金额为 0', free?.cny === 0, JSON.stringify(free));
  check('计费期成功搜索计入 2 次（失败 / 无结果 / web_fetch 不算）', billed?.calls === 2, JSON.stringify(billed));
  check('计费期金额 = 2 × 单价', billed?.cny === Number((2 * SEARCH_CALL_PRICE).toFixed(6)), JSON.stringify(billed));
  check('计费起点是 11-01', SEARCH_BILLING_FROM === '2026-11-01', SEARCH_BILLING_FROM);
  check('聚合结果带 searchBilling 元数据', data.searchBilling?.ratePerThousand === 5 && data.searchBilling?.from === SEARCH_BILLING_FROM, JSON.stringify(data.searchBilling));
  check('工具记录不影响 token 聚合（calls=1）', data.calls === 1, String(data.calls));
} finally {
  try { rmSync(root, { recursive: true, force: true }); } catch { /* 清理失败不影响结论 */ }
}

if (bad > 0) {
  console.error(`FAIL: 工具调用计费有 ${bad} 项不符合预期`);
  process.exit(1);
}
console.log('TOOLS OK');
