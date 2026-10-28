/**
 * 回归测试：设置 schema 补出来的默认费率，必须与 core.mjs 里的官方费率一致。
 *
 * 背景（真实踩过的坑）：schemastery 会把缺失的 offPeak / peak **整个补出来**，
 * 若两档共用同一个带默认值的 schema，高峰档就会被填成空闲价（0.02/1/4），
 * 于是高峰时段的费用被按半价计算 —— 这是本插件的核心数字，必须守住。
 */
import { PRICE_TIERS, costOf, rateKeyOf, channelRateOf } from '../src/core.mjs';
import { loadConfigSchema } from '../lib/index.js';

const Schema = await loadConfigSchema();
if (!Schema) {
  console.error('FAIL: 设置 schema 加载失败（先跑 npm run setup 建 junction）');
  process.exit(1);
}

const base = Schema({});
const models = ['deepseek-flash', 'deepseek-v4-pro'];
const fields = ['cacheHit', 'cacheMiss', 'output'];
let bad = 0;

for (const [tierKey, field] of [['offPeak', 'offPeak'], ['peak', 'peak']]) {
  for (const m of models) {
    const got = base?.[tierKey]?.[m];
    const want = PRICE_TIERS[m];
    if (!got) { console.log(`FAIL 缺少 ${tierKey}.${m}`); bad++; continue; }
    for (const f of fields) {
      const expect = want[f][field];
      if (Number(got[f]) !== Number(expect)) {
        console.log(`FAIL ${tierKey}.${m}.${f}: 期望 ${expect}，实际 ${got[f]}`);
        bad++;
      }
    }
  }
}

// 关键性质：高峰价必须与空闲价不同——这正是本次踩的坑
for (const m of models) {
  if (JSON.stringify(base?.peak?.[m]) === JSON.stringify(base?.offPeak?.[m])) {
    console.log(`FAIL 高峰费率 == 空闲费率（${m}）：高峰时段会被按半价计算`);
    bad++;
  }
}

/* 第三方固定价（GLM / Kimi）：按 model id 计价，provider 名不参与 */
const OFF = Date.parse('2026-09-21T05:00:00Z'); // 北京时间周一 13:00（空闲档，第三方固定价不受影响）
const oneM = { inputTokens: 1e6, cacheReadTokens: 1e6, outputTokens: 1e6, cacheWriteTokens: 1e6 };
const cases = [
  ['glm-5.3', { input: 8, read: 2, output: 28, write: 0 }],
  ['kimi-k3.1-pro', { input: 13, read: 1.3, output: 68, write: 13 }],
  ['KIMI-K3.1-PRO', { input: 13, read: 1.3, output: 68, write: 13 }],
  ['moonshot/kimi-k3', { input: 20, read: 2, output: 100, write: 20 }],
];
for (const [model, want] of cases) {
  if (!rateKeyOf(model)) { console.log(`FAIL 第三方模型未命中费率表：${model}`); bad++; continue; }
  const got = costOf(oneM, model, OFF);
  const expect = want.input + want.read + want.output + want.write;
  if (!got || Math.abs(got.cny - expect) > 1e-9) {
    console.log(`FAIL ${model} 1M×4 应=${expect} 实际=${got?.cny}`); bad++;
  }
  if (got && (got.unit.hit !== want.read || got.unit.miss !== want.input || got.unit.out !== want.output || got.unit.cacheWrite !== want.write)) {
    console.log(`FAIL ${model} 单价不符：${JSON.stringify(got.unit)}`); bad++;
  }
}

// 设置里的 DeepSeek 费率覆盖不应把 GLM / Kimi 也改成 flash 价
const overridden = Schema({
  offPeak: { 'deepseek-flash': { cacheHit: 9, cacheMiss: 9, output: 9 }, 'deepseek-v4-pro': { cacheHit: 9, cacheMiss: 9, output: 9 } },
  peak: { 'deepseek-flash': { cacheHit: 9, cacheMiss: 9, output: 9 }, 'deepseek-v4-pro': { cacheHit: 9, cacheMiss: 9, output: 9 } },
});
if (overridden.offPeak['deepseek-flash'].cacheMiss !== 9) { console.log('FAIL 设置覆盖 DeepSeek 费率未生效'); bad++; }
if (JSON.stringify(PRICE_TIERS['glm-5.3'].cacheMiss) !== JSON.stringify({ offPeak: 8, peak: 8 })) { console.log('FAIL GLM 内置价被改动'); bad++; }

/* 自定义渠道单价：命中后按固定价（不分峰谷），provider/模型支持 '*' 兜底，非法配置回落内置价 */
const channelRates = {
  'pi-ai': { 'deepseek-v4-pro': { cacheHit: 0.5, cacheMiss: 3, output: 9 } },
  '*': { '*': { cacheHit: 0, cacheMiss: 2, output: 4 } },
};
const allOne = { inputTokens: 1e6, cacheReadTokens: 1e6, outputTokens: 1e6 };
const channelCase = costOf(allOne, 'deepseek-v4-pro', OFF, PRICE_TIERS, channelRates, 'pi-ai');
if (!channelCase || Math.abs(channelCase.cny - 12.5) > 1e-9) {
  console.log(`FAIL 渠道单价未生效：期望 12.5，实际 ${channelCase?.cny}`); bad++;
} else if (channelCase.tier !== 'channel:pi-ai') {
  console.log(`FAIL 渠道单价 tier 标记错误：${channelCase.tier}`); bad++;
}
const channelPeak = costOf(allOne, 'deepseek-v4-pro', Date.parse('2026-09-21T02:00:00Z'), PRICE_TIERS, channelRates, 'pi-ai');
if (!channelPeak || Math.abs(channelPeak.cny - 12.5) > 1e-9) {
  console.log(`FAIL 渠道单价不应分峰谷：${channelPeak?.cny}`); bad++;
}
const wildcardCase = costOf(allOne, 'glm-5.3', OFF, PRICE_TIERS, channelRates, 'some-relay');
if (!wildcardCase || Math.abs(wildcardCase.cny - 6) > 1e-9) {
  console.log(`FAIL provider/model '*' 兜底未生效：${wildcardCase?.cny}`); bad++;
}
const badChannel = costOf(allOne, 'glm-5.3', OFF, PRICE_TIERS, { 'pi-ai': { 'glm-5.3': { cacheHit: 1, cacheMiss: 1 } } }, 'pi-ai');
if (!badChannel || Math.abs(badChannel.cny - 38) > 1e-9 || badChannel.tier.startsWith('channel:')) {
  console.log(`FAIL 字段不全的渠道价应回落内置价：${badChannel?.cny} / ${badChannel?.tier}`); bad++;
}
if (channelRateOf(null, 'pi-ai', 'glm-5.3') !== null) { console.log('FAIL 空渠道配置应返回 null'); bad++; }

// 设置 schema 必须原样保留自定义渠道单价（动态键不能被 schemastery 吃掉）
const withChannels = Schema({ channelRates: { 'pi-ai': { '*': { cacheHit: 1, cacheMiss: 2, output: 3 } } } });
if (!withChannels.channelRates?.['pi-ai']?.['*']) {
  console.log(`FAIL 设置 schema 丢掉 channelRates：${JSON.stringify(withChannels.channelRates)}`); bad++;
}

console.log(bad === 0 ? 'RATES OK（DeepSeek 峰谷价 + GLM/Kimi 固定价 + 自定义渠道价）' : `RATES 失败项: ${bad}`);
process.exit(bad === 0 ? 0 : 1);
