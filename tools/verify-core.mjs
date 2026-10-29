/** 自检：摘要聚合 + 计费 + 时区 + 与既有数字对照 */
import { aggregate, costOf, isPeakHour, dayKeyOf, PRICE_TIERS, OFFICIAL_PROVIDERS } from '../src/core.mjs';
import { sessionsRoot } from './paths.mjs';

const ROOT = sessionsRoot();
const t0 = Date.now();
const data = aggregate(ROOT);
console.log(`files=${data.filesScanned} skippedStale=${data.filesSkippedAsStale.length} unreadable=${data.unreadableFiles} calls=${data.calls} unpriced=${data.unpricedCalls} in ${Date.now() - t0}ms`);
console.log('\n-- per day (Beijing) --');
for (const [day, e] of Object.entries(data.days).sort()) {
  console.log(`${day} calls=${String(e.calls).padStart(4)} miss=${String(e.miss).padStart(9)} hit=${String(e.hit).padStart(11)} out=${String(e.out).padStart(7)} rate=${e.hitRate}% CNY=${e.cny.toFixed(4)} peak=${e.peakCalls}`);
}
const tot = Object.values(data.days).reduce((a, e) => ({
  calls: a.calls + e.calls, miss: a.miss + e.miss, hit: a.hit + e.hit, out: a.out + e.out, cny: a.cny + e.cny,
}), { calls: 0, miss: 0, hit: 0, out: 0, cny: 0 });
console.log(`TOTAL calls=${tot.calls} miss=${tot.miss} hit=${tot.hit} out=${tot.out} CNY=${tot.cny.toFixed(3)}`);
// 分时花费不变量：每天的 byHourCny 之和 = 当天金额（分时柱的花费视角靠这个口径才自洽）
const hourCostBad = Object.entries(data.days).filter(([, e]) => {
  const sum = (e.byHourCny ?? []).reduce((acc, v) => acc + v, 0);
  return e.cny > 0 && Math.abs(sum - e.cny) > Math.max(0.01, e.cny * 1e-3);
});
if (hourCostBad.length) {
  console.error(`FAIL: 分时花费之和与当日金额不一致（允许 1‰ 四舍五入误差）: ${hourCostBad.map(([day, e]) => `${day} sum=${(e.byHourCny ?? []).reduce((a, v) => a + v, 0).toFixed(4)} cny=${e.cny.toFixed(4)}`).join('; ')}`);
  process.exit(1);
}
console.log('hour-cost invariant OK（每天 byHourCny 之和 = 当日 cny）');
// 渠道不变量：账号额度 + API Key + 第三方 = 当天全部花费（每条调用只归一个渠道）
const channelBad = Object.entries(data.days).filter(([day, e]) => {
  const account = data.daysAccount?.[day]?.cny ?? 0;
  const apiKey = data.daysApiKey?.[day]?.cny ?? 0;
  const third = data.daysThirdParty?.[day]?.cny ?? 0;
  return Math.abs(account + apiKey + third - e.cny) > Math.max(0.005, e.cny * 1e-3);
});
if (channelBad.length) {
  console.error(`FAIL: 渠道金额之和与当日金额不一致: ${channelBad.map(([day, e]) => `${day} channel=${(((data.daysAccount?.[day]?.cny ?? 0) + (data.daysApiKey?.[day]?.cny ?? 0) + (data.daysThirdParty?.[day]?.cny ?? 0))).toFixed(4)} cny=${e.cny.toFixed(4)}`).join('; ')}`);
  process.exit(1);
}
console.log('channel invariant OK（账号额度 + API Key + 第三方 = 当日 cny）');
console.log('\n-- providers --');
console.log(`  （计费口径：${OFFICIAL_PROVIDERS.join(' / ')}，其他 provider 只记 token）`);
for (const [p, v] of Object.entries(data.providers)) {
  const billed = OFFICIAL_PROVIDERS.includes(p) ? 'billed' : 'tokens-only (officialOnly=false 才会出现)';
  console.log(`  ${p}: calls=${v.calls} tokens=${v.tokens} CNY=${v.cny.toFixed(3)} [${billed}]`);
}
console.log('\n-- models --');
for (const [m, v] of Object.entries(data.models)) console.log(`  ${m}: calls=${v.calls} CNY=${v.cny.toFixed(3)} rate=${v.hitRate}%`);

console.log('\n-- pricing tiers self-check --');
const u = { inputTokens: 1e6, cacheReadTokens: 1e6, outputTokens: 1e6 };
const cases = [
  ['2026-09-19T02:00:00Z', 'Sat 10:00 CST (off-peak)'],
  ['2026-09-21T02:00:00Z', 'Mon 10:00 CST (peak)'],
  ['2026-09-21T05:00:00Z', 'Mon 13:00 CST (off-peak, lunch)'],
  ['2026-09-21T07:00:00Z', 'Mon 15:00 CST (peak)'],
  ['2026-09-21T11:00:00Z', 'Mon 19:00 CST (off-peak)'],
];
for (const [iso, label] of cases) {
  const ms = Date.parse(iso);
  const c = costOf(u, 'deepseek-flash', ms);
  console.log(`  ${isPeakHour(ms) ? 'PEAK' : 'off '} ${label} -> CNY ${c.cny.toFixed(2)} (hit ${c.unit.hit} miss ${c.unit.miss} out ${c.unit.out})`);
}
const pro = costOf({ inputTokens: 2e6 }, 'deepseek-v4-pro', Date.parse('2026-09-21T02:00:00Z'));
console.log(`  v4-pro peak 2M miss = ${pro.cny} (expect 18)`);
console.log(`  unknown model -> ${JSON.stringify(costOf(u, 'gpt-99', Date.now()))} (expect null)`);
console.log(`  today key = ${dayKeyOf(Date.now())}`);
