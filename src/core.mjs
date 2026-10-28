/**
 * dsh-token-cost 采集内核：把 DSH 会话日志聚合成「按天 / 按会话 / 按模型」的用量与花费。
 * 只依赖 node: 内置模块与 ./zstd.mjs，可独立测试（tools/*.mjs 直接跑它）。
 * 派生自 dsh-token-meter-panel（MIT, Copyright (c) 2026 oli20）；新增 dayModels 聚合。
 */

import { readdirSync, statSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { readSessionRecords } from './zstd.mjs';

/* ------------------------------------------------------------------ *
 * 费率表（CNY / 百万 token）
 *
 * DeepSeek：https://api-docs.deepseek.com/zh-cn/quick_start/pricing（核实于 2026-09-19）
 *   - 现实售模型只有 deepseek-flash 与 deepseek-v4-pro（deepseek-chat / reasoner 已下线）
 *   - 分「高峰 / 空闲」两档，空闲价 = 高峰价的一半
 *   - 高峰 = 北京时间周一至周五 9:00-12:00 与 14:00-18:00（法定节假日除外，本工具不识别节假日）
 *
 * 第三方（固定单价，不区分峰谷）：
 *   - GLM / 智谱 BigModel：https://open.bigmodel.cn/pricing（核实于 2026-10-28）
 *   - Kimi / 月之暗面：https://platform.kimi.com/docs/pricing/chat（核实于 2026-10-28）
 *   - 这些路由通常由 pi-ai 多 provider 适配器接入，日志里的 provider 可能是任意路由名；
 *     因此按 **model id** 计价，provider 名不参与定价。
 *   - 长上下文阶梯价 / 限时折扣 / 套餐价无法从聚合 token 还原，内置值取标准档基础价；
 *     需要精确账单时请以官方页面为准。
 * ------------------------------------------------------------------ */
export const PRICING_SOURCE = 'https://api-docs.deepseek.com/zh-cn/quick_start/pricing';
export const PRICING_FETCHED_AT = '2026-09-19';
/** 第三方国产模型的官方价格来源（面板/文档用） */
export const THIRD_PARTY_PRICING = [
  {
    vendor: 'GLM / 智谱',
    source: 'https://open.bigmodel.cn/pricing',
    fetchedAt: '2026-10-28',
    note: '固定单价；长上下文阶梯价取基础档，限时折扣不内置',
  },
  {
    vendor: 'Kimi / 月之暗面',
    source: 'https://platform.kimi.com/docs/pricing/chat',
    fetchedAt: '2026-10-28',
    note: '固定单价；K3 系列缓存写入按 5min TTL 价计',
  },
];

/**
 * 工具调用（Search）单独计费：官方价 5 元 / 1,000 次成功请求（元/次）。
 * 北京时间 2026-11-01 00:00 起开始计费，之前的调用免费 —— 官方公告原话：
 * “Search 和 Fetch 按成功请求次数计费……目前未计费，将于 2026-11-01 00:00 起按次收取”。
 *
 * 本地日志只有 **工具调用** 记录，没有服务端实际请求数，所以这里按工具调用次数估算：
 *   - web_search：DSH 走 Messages 服务端搜索，一次工具调用可能触发多次服务端搜索 → 本值是下界；
 *   - web_fetch：DSH 默认走本地 HTTP 抓取，不经过 DeepSeek，不计费。
 */
export const SEARCH_CALL_PRICE = 5 / 1000;
export const SEARCH_BILLING_FROM = '2026-11-01';
export const SEARCH_TOOL_NAME = 'web_search';

/** 固定单价（不区分峰谷）的费率三元组 */
const flat = (cacheHit, cacheMiss, output, cacheWrite = 0) => ({
  cacheHit: { offPeak: cacheHit, peak: cacheHit },
  cacheMiss: { offPeak: cacheMiss, peak: cacheMiss },
  output: { offPeak: output, peak: output },
  cacheWrite: { offPeak: cacheWrite, peak: cacheWrite },
});

export const PRICE_TIERS = {
  'deepseek-flash': {
    label: 'deepseek-flash',
    cacheHit: { offPeak: 0.02, peak: 0.04 },
    cacheMiss: { offPeak: 1, peak: 2 },
    output: { offPeak: 4, peak: 8 },
  },
  'deepseek-v4-pro': {
    label: 'deepseek-v4-pro',
    cacheHit: { offPeak: 0.15, peak: 0.3 },
    cacheMiss: { offPeak: 4.5, peak: 9 },
    output: { offPeak: 13.5, peak: 27 },
  },
  /* 退役模型名，实际由 V4.1-Flash 提供服务，按 Flash 价计费 */
  'deepseek-v4-flash': {
    label: 'deepseek-flash（退役名 v4-flash）',
    cacheHit: { offPeak: 0.02, peak: 0.04 },
    cacheMiss: { offPeak: 1, peak: 2 },
    output: { offPeak: 4, peak: 8 },
  },
  'deepseek-v4-flash-vision-exp': {
    label: 'deepseek-flash（vision-exp）',
    cacheHit: { offPeak: 0.02, peak: 0.04 },
    cacheMiss: { offPeak: 1, peak: 2 },
    output: { offPeak: 4, peak: 8 },
  },

  /* GLM / 智谱（元/百万 token，标准档） */
  'glm-5.3': { label: 'GLM-5.3（智谱）', ...flat(2, 8, 28) },
  'glm-5.2': { label: 'GLM-5.2（智谱）', ...flat(2, 8, 28) },
  'glm-5.1': { label: 'GLM-5.1（智谱，基础档）', ...flat(1.3, 6, 24) },
  'glm-5.3-flash': { label: 'GLM-5.3-Flash（智谱）', ...flat(0.23, 0.8, 2.8) },
  'glm-5.3-flashx': { label: 'GLM-5.3-FlashX（智谱）', ...flat(0.57, 2, 7) },
  'glm-4.7-flash': { label: 'GLM-4.7-Flash（智谱，免费）', ...flat(0, 0, 0) },

  /* Kimi / 月之暗面（元/百万 token；cacheWrite 为 5min TTL 价） */
  'kimi-k3.1-pro': { label: 'Kimi K3.1 Pro', ...flat(1.3, 13, 68, 13) },
  'kimi-k3.1-pro-highspeed': { label: 'Kimi K3.1 Pro 高速版', ...flat(1.3, 26, 136, 26) },
  'kimi-k3': { label: 'Kimi K3', ...flat(2, 20, 100, 20) },
  'kimi-k2.7-code': { label: 'Kimi K2.7 Code', ...flat(1.3, 6.5, 27) },
  'kimi-k2.7-code-highspeed': { label: 'Kimi K2.7 Code 高速版', ...flat(2.6, 13, 54) },
  'kimi-k2.6': { label: 'Kimi K2.6', ...flat(1.1, 6.5, 27) },
};
/**
 * DeepSeek 官方 provider 路由（用于把官方用量接口与本地第三方用量分开合并）。
 *   - deepseek-official：API Key 路由（@deepseek-ai/dsh-llm-deepseek-api-key 注册）
 *   - deepseek-account ：桌面端 DeepSeek 账号登录路由（@deepseek-ai/dsh-llm-deepseek-account）
 * 两个 id 必须与基座实际注册的 provider 名一致：只写死 official 时，用桌面端
 * 账号登录的会话（本地日志里 source.provider === 'deepseek-account'）一条都统计不到。
 *
 * 其他 provider（pi-ai 路由、第三方中转、自建端点）在 includeOtherProviders=true 时
 * 一并统计；有内置费率的模型（GLM / Kimi / DeepSeek）按 model id 计价，未知模型只记 token。
 */
export const OFFICIAL_PROVIDERS = ['deepseek-official', 'deepseek-account'];
/** @deprecated 改用 OFFICIAL_PROVIDERS；仅保留旧名，避免破坏外部导入。 */
export const BILLING_PROVIDER = OFFICIAL_PROVIDERS[0];

/* ------------------------------------------------------------------ *
 * 时间：一律按北京时间（UTC+8）分桶，与机器时区解耦
 * ------------------------------------------------------------------ */
const CST_MS = 8 * 3600 * 1000;
export const toCst = (ms) => new Date(ms + CST_MS);
/** 'YYYY-MM-DD'（北京时间） */
export const dayKeyOf = (ms) => toCst(ms).toISOString().slice(0, 10);
/** 0-23（北京时间） */
export const hourOf = (ms) => toCst(ms).getUTCHours();
/** 是否高峰时段：北京时间周一至周五 9-12、14-18 */
export function isPeakHour(ms) {
  const d = toCst(ms);
  const dow = d.getUTCDay();
  if (dow === 0 || dow === 6) return false;
  const h = d.getUTCHours() + d.getUTCMinutes() / 60;
  return (h >= 9 && h < 12) || (h >= 14 && h < 18);
}

/* ------------------------------------------------------------------ *
 * 单次调用的花费
 * ------------------------------------------------------------------ */
/**
 * 模型名归一化：日志里的 model 可能带大小写或 provider 前缀（如 `zhipu/glm-5.3`、
 * `moonshot:kimi-k3`）。按「原样 → 小写 → 去掉前缀后的最后一段」依次匹配费率表。
 * @param {string} model
 * @param {object} rates
 * @returns {string|null} 命中的费率键
 */
export function rateKeyOf(model, rates = PRICE_TIERS) {
  if (!model) return null;
  const raw = String(model).trim();
  if (rates[raw]) return raw;
  const lower = raw.toLowerCase();
  if (rates[lower]) return lower;
  for (const separator of ['/', ':']) {
    const at = lower.lastIndexOf(separator);
    if (at >= 0 && rates[lower.slice(at + 1)]) return lower.slice(at + 1);
  }
  return null;
}

/**
 * 自定义渠道单价：`{ [provider 或 '*']: { [模型名 / 归一化键 / '*']: { cacheHit, cacheMiss, output, cacheWrite? } } }`。
 * 命中即按固定单价（元 / 百万 token）计费、不分峰谷；字段不全或非数字视为没配，
 * 回落到按 model id 的官方 / 内置费率。provider / 模型都可用 `*` 兜底。
 * @param {object|null} channelRates
 * @param {string|null} provider 日志里的 provider 名
 * @param {string} model
 * @returns {{cacheHit:number, cacheMiss:number, output:number, cacheWrite:number, tier:string}|null}
 */
export function channelRateOf(channelRates, provider, model) {
  if (!channelRates || typeof channelRates !== 'object') return null;
  const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);
  const providers = [...(provider ? [provider] : []), '*'];
  for (const p of providers) {
    const table = channelRates[p];
    if (!table || typeof table !== 'object') continue;
    // rateKeyOf 自带「原样 → 小写 → 去 provider 前缀」的匹配；没命中再看 '*' 兜底
    const key = rateKeyOf(model, table) ?? (table['*'] ? '*' : null);
    if (!key) continue;
    const r = table[key];
    if (!r || typeof r !== 'object') continue;
    const cacheHit = num(r.cacheHit), cacheMiss = num(r.cacheMiss), output = num(r.output);
    if (cacheHit === null || cacheMiss === null || output === null) continue;
    return { cacheHit, cacheMiss, output, cacheWrite: num(r.cacheWrite) ?? 0, tier: `channel:${p}` };
  }
  return null;
}

/**
 * @param {{inputTokens?:number, cacheReadTokens?:number, outputTokens?:number, cacheWriteTokens?:number}} usage
 * @param {string} model 模型名
 * @param {number} ms 该次调用的时间戳（epoch ms）
 * @param {object} rates 费率表（可选，形如 PRICE_TIERS）
 * @param {object|null} channelRates 自定义渠道单价（可选，命中时优先于 rates）
 * @param {string|null} provider 渠道名（可选，用于渠道单价匹配）
 * @returns {{cny:number, peak:boolean, priced:boolean, tier:string, unit:{hit:number,miss:number,out:number,cacheWrite:number}}|null}
 *          未知模型返回 null：只记 token、不猜价钱（宁可不显示金额，也不给错数字）
 */
export function costOf(usage, model, ms, rates = PRICE_TIERS, channelRates = null, provider = null) {
  const channel = channelRateOf(channelRates, provider, model);
  if (channel) {
    const cny =
      ((usage.inputTokens || 0) / 1e6) * channel.cacheMiss +
      ((usage.cacheReadTokens || 0) / 1e6) * channel.cacheHit +
      ((usage.outputTokens || 0) / 1e6) * channel.output +
      ((usage.cacheWriteTokens || 0) / 1e6) * channel.cacheWrite;
    // 渠道单价是固定价：不区分峰谷，peak 记 false
    return { cny, peak: false, priced: true, tier: channel.tier, unit: { hit: channel.cacheHit, miss: channel.cacheMiss, out: channel.output, cacheWrite: channel.cacheWrite } };
  }
  const key = rateKeyOf(model, rates);
  if (!key) return null; // 未知模型：只记 token，不猜价钱
  const tier = rates[key];
  const peak = isPeakHour(ms);
  const pick = (p) => (typeof p === 'number' ? p : peak ? p.peak : p.offPeak);
  const hit = pick(tier.cacheHit), miss = pick(tier.cacheMiss), out = pick(tier.output);
  // 缓存写入：DeepSeek 不计费；Kimi K3 按 5min TTL 单独计费；GLM 缓存存储免费
  const cacheWrite = tier.cacheWrite ? pick(tier.cacheWrite) : 0;
  const cny =
    ((usage.inputTokens || 0) / 1e6) * miss +
    ((usage.cacheReadTokens || 0) / 1e6) * hit +
    ((usage.outputTokens || 0) / 1e6) * out +
    ((usage.cacheWriteTokens || 0) / 1e6) * cacheWrite;
  return { cny, peak, priced: true, tier: key, unit: { hit, miss, out, cacheWrite } };
}

/* ------------------------------------------------------------------ *
 * 从一条日志记录里取用量（唯一权威口径）
 *   - assistant/message 携带 data.usage
 *   - assistant/attempt（重试/中断）的用量只在流式块的最后一个 usage chunk 里
 *   - data.stream[].chunk.usage 与 data.usage 是同一份数据，重复累加会翻倍
 * ------------------------------------------------------------------ */
export function usageOf(rec) {
  if (rec.type === 'assistant/message' && rec.data?.usage) {
    return { usage: rec.data.usage, source: rec.data.message?.source, time: rec.time };
  }
  if (rec.type === 'assistant/attempt') {
    const stream = rec.data?.stream;
    if (Array.isArray(stream)) {
      for (let i = stream.length - 1; i >= 0; i--) {
        const u = stream[i]?.chunk?.usage;
        if (u) return { usage: u, source: undefined, time: rec.time };
      }
    }
  }
  return null;
}

/* ------------------------------------------------------------------ *
 * 聚合
 * ------------------------------------------------------------------ */
function blankBucket() {
  return {
    miss: 0, hit: 0, out: 0, cacheWrite: 0, reasoning: 0, calls: 0,
    cny: 0, peakCalls: 0, unpricedCalls: 0,
    // 按 token 类型拆分的实际花费（跨 provider 精确：每类 token × 该模型当时的单价）
    costByType: { hit: 0, miss: 0, out: 0, cacheWrite: 0 },
    // 峰/谷分档累计（同一批 token 在高峰、空闲两档分别花了多少）
    tier: {
      peak: { hit: 0, miss: 0, out: 0, cny: 0, calls: 0 },
      offPeak: { hit: 0, miss: 0, out: 0, cny: 0, calls: 0 },
    },
    firstTime: null, lastTime: null,
    byHour: new Array(24).fill(0),
    models: new Map(),
  };
}

function accumulate(bucket, usage, model, ms, cost) {
  bucket.miss += usage.inputTokens || 0;
  bucket.hit += usage.cacheReadTokens || 0;
  bucket.out += usage.outputTokens || 0;
  bucket.cacheWrite += usage.cacheWriteTokens || 0;
  bucket.reasoning += usage.reasoningTokens || 0;
  bucket.calls += 1;
  if (bucket.firstTime == null || ms < bucket.firstTime) bucket.firstTime = ms;
  if (bucket.lastTime == null || ms > bucket.lastTime) bucket.lastTime = ms;
  if (cost) {
    bucket.cny += cost.cny;
    bucket.costByType.hit += ((usage.cacheReadTokens || 0) / 1e6) * cost.unit.hit;
    bucket.costByType.miss += ((usage.inputTokens || 0) / 1e6) * cost.unit.miss;
    bucket.costByType.out += ((usage.outputTokens || 0) / 1e6) * cost.unit.out;
    bucket.costByType.cacheWrite += ((usage.cacheWriteTokens || 0) / 1e6) * (cost.unit.cacheWrite || 0);
    if (cost.peak) bucket.peakCalls += 1;
    // 按该次调用所处的档位分别记账（峰/谷各一份），后面面板要分开显示再汇总
    const t = cost.peak ? bucket.tier.peak : bucket.tier.offPeak;
    t.hit += usage.cacheReadTokens || 0;
    t.miss += usage.inputTokens || 0;
    t.out += usage.outputTokens || 0;
    t.cny += cost.cny;
    t.calls += 1;
  } else {
    bucket.unpricedCalls += 1;
  }
  bucket.byHour[hourOf(ms)] += (usage.inputTokens || 0) + (usage.cacheReadTokens || 0) + (usage.outputTokens || 0);
  if (model) bucket.models.set(model, (bucket.models.get(model) || 0) + 1);
}

function packBucket(b) {
  const totalIn = b.hit + b.miss;
  const packTier = (t) => ({
    miss: t.miss, hit: t.hit, out: t.out,
    calls: t.calls, cny: Number(t.cny.toFixed(6)),
  });
  return {
    miss: b.miss, hit: b.hit, out: b.out, cacheWrite: b.cacheWrite, reasoning: b.reasoning,
    calls: b.calls, cny: Number(b.cny.toFixed(6)), peakCalls: b.peakCalls, unpricedCalls: b.unpricedCalls,
    costByType: {
      hit: Number(b.costByType.hit.toFixed(6)), miss: Number(b.costByType.miss.toFixed(6)),
      out: Number(b.costByType.out.toFixed(6)), cacheWrite: Number(b.costByType.cacheWrite.toFixed(6)),
    },
    firstTime: b.firstTime, lastTime: b.lastTime,
    hitRate: totalIn > 0 ? Number(((100 * b.hit) / totalIn).toFixed(1)) : null,
    byHour: b.byHour,
    models: Object.fromEntries(b.models),
    tier: b.tier ? { peak: packTier(b.tier.peak), offPeak: packTier(b.tier.offPeak) } : undefined,
  };
}

/** 把 src 桶累加进 dst —— 用于缓存复用：每个文件的贡献单独算，命中缓存时直接合并。 */
function mergeBucket(dst, src) {
  dst.miss += src.miss; dst.hit += src.hit; dst.out += src.out;
  dst.cacheWrite += src.cacheWrite; dst.reasoning += src.reasoning;
  dst.calls += src.calls; dst.cny += src.cny;
  dst.peakCalls += src.peakCalls; dst.unpricedCalls += src.unpricedCalls;
  for (const key of ['hit', 'miss', 'out', 'cacheWrite']) dst.costByType[key] += src.costByType?.[key] ?? 0;
  if (src.firstTime != null && (dst.firstTime == null || src.firstTime < dst.firstTime)) dst.firstTime = src.firstTime;
  if (src.lastTime != null && (dst.lastTime == null || src.lastTime > dst.lastTime)) dst.lastTime = src.lastTime;
  for (let i = 0; i < 24; i += 1) dst.byHour[i] += src.byHour[i];
  for (const tier of ['peak', 'offPeak']) {
    const a = dst.tier[tier], b = src.tier[tier];
    a.hit += b.hit; a.miss += b.miss; a.out += b.out; a.cny += b.cny; a.calls += b.calls;
  }
  for (const [m, n] of src.models) dst.models.set(m, (dst.models.get(m) || 0) + n);
}

/**
 * 算「一个会话日志文件」对总量的贡献，与全局状态无关 —— 因此可以按 (mtimeMs, size) 缓存：
 * 文件没变就直接合并上次的结果，跳过解压与解析（工作机上全量重扫曾要 70 秒）。
 * @param {object[]} records 该文件的记录
 * @param {{rates:object, includeOtherProviders:boolean, billingProviders:string[]}} opts
 * @param {object} f 文件描述（workspace/sessionId）
 */
function contributionOf(records, opts, f) {
  const { rates, includeOtherProviders, billingProviders, channelRates = null } = opts;
  const days = new Map();
  // 非 DeepSeek 官方 provider 的按天贡献；宿主用它把「官方用量」与「第三方用量」合并展示
  const daysThirdParty = new Map();
  // 工具调用（Search）按天：{ calls, cny }。官方按成功请求单独计费，
  // 本地只能数到工具调用次数（没有服务端请求数），且 2026-11-01 之前免费。
  const searchDays = new Map();
  /** 尚未看到结果的 tool/call：callId → { name, time }，用结果判断成功/失败 */
  const pendingTools = new Map();
  const models = new Map();
  // 按「日期 | provider | model」再分一层：面板/导出要按时间窗口看模型明细，
  // 只保留全局 models 的话选了 7 天也只能看到全历史。这一层复用同一个 bucket，聚合逻辑不变。
  const dayModels = new Map();
  const providers = new Map();
  const bucket = blankBucket();
  bucket.id = f.sessionId;
  bucket.workspace = f.workspace;
  bucket.title = null;
  bucket.createdAt = null;
  bucket.delegationDepth = 0;
  bucket.parentId = null;
  bucket.agentLabel = null;
  let calls = 0;
  let unpriced = 0;

  for (const rec of records) {
    if (rec.type === 'session') {
      bucket.createdAt = rec.createdAt ?? rec.time ?? null;
      bucket.delegationDepth = rec.delegationDepth ?? 0;
      bucket.parentId = rec.parentSession ?? null;
      continue;
    }
    if (rec.type === 'subagent/descriptor') {
      bucket.agentLabel = rec.data?.label ?? rec.data?.description ?? bucket.agentLabel;
      continue;
    }
    if (rec.type === 'session/title' && rec.data?.title) {
      bucket.title = rec.data.title;
      continue;
    }
    // 工具调用先挂起，等 tool/result 判断是否成功（官方按「成功请求」计费）
    if (rec.type === 'tool/call') {
      if (rec.data?.callId) {
        pendingTools.set(rec.data.callId, { name: rec.data.name, time: rec.time ?? Date.now() });
      }
      continue;
    }
    if (rec.type === 'tool/result') {
      const callId = rec.data?.message?.toolCallId ?? rec.data?.toolCallId;
      const pending = callId ? pendingTools.get(callId) : null;
      if (pending) {
        pendingTools.delete(callId);
        const failed = Boolean(rec.data?.message?.isError ?? rec.data?.isError);
        if (!failed && pending.name === SEARCH_TOOL_NAME) {
          const dk = dayKeyOf(pending.time ?? rec.time ?? Date.now());
          const cur = searchDays.get(dk) ?? { calls: 0, cny: 0 };
          cur.calls += 1;
          if (dk >= SEARCH_BILLING_FROM) cur.cny += SEARCH_CALL_PRICE;
          searchDays.set(dk, cur);
        }
      }
      continue;
    }
    const got = usageOf(rec);
    if (!got) continue;
    const provider = got.source?.provider ?? 'unknown';
    const model = got.source?.model ?? 'unknown';
    const official = billingProviders.includes(provider);
    if (!official && !includeOtherProviders) continue;

    calls += 1;
    // 任何 provider 都按 model id 查费率表：DeepSeek / GLM / Kimi 有内置价，
    // 其余第三方模型记 token、不计金额（不强猜）。
    const cost = costOf(got.usage, model, got.time, rates, channelRates, provider);
    if (!cost) unpriced += 1;
    const tokens = (got.usage.inputTokens || 0) + (got.usage.cacheReadTokens || 0) + (got.usage.outputTokens || 0);

    const dk = dayKeyOf(got.time);
    if (!days.has(dk)) days.set(dk, blankBucket());
    accumulate(days.get(dk), got.usage, model, got.time, cost);
    accumulate(bucket, got.usage, model, got.time, cost);
    if (!official) {
      if (!daysThirdParty.has(dk)) daysThirdParty.set(dk, blankBucket());
      accumulate(daysThirdParty.get(dk), got.usage, model, got.time, cost);
    }

    const mk = `${provider} | ${model}`;
    if (!models.has(mk)) models.set(mk, blankBucket());
    accumulate(models.get(mk), got.usage, model, got.time, cost);

    const dmk = `${dk}|${mk}`;
    if (!dayModels.has(dmk)) dayModels.set(dmk, blankBucket());
    accumulate(dayModels.get(dmk), got.usage, model, got.time, cost);

    const pt = providers.get(provider) ?? { calls: 0, tokens: 0, cny: 0 };
    pt.calls += 1; pt.tokens += tokens; pt.cny += cost ? cost.cny : 0;
    providers.set(provider, pt);
  }
  bucket.isSubagent = bucket.delegationDepth > 0;
  return { key: `${f.workspace}/${f.sessionId}`, session: bucket, days, daysThirdParty, searchDays, models, dayModels, providers, calls, unpriced };
}

/**
 * 会话日志文件名 → 格式代际。
 * 官方持久化布局（@deepseek-ai/dsh-session-persistence-jsonl）：
 *   `session.jsonl[.zstd]`（v0）、`session.vN.jsonl[.zstd]`
 * 运行时永远只读写「数值最高的 generation」，而迁移出的旧代际文件按设计
 * **逐字节保留在磁盘上**（"源保持逐字节不变"）。因此同一会话目录里出现
 * v3 + v4、v1 + v4、裸 session.jsonl + v4 都是正常状态，扫描时必须只取最高一代：
 *   - 全都收 → 同一批用量被算两次，金额翻倍
 *   - 写死只认某一代（早先是 v3）→ 升级到 v4 之后新增用量永远看不到
 * @param {string} name 文件名
 * @returns {{gen:number, compressed:boolean}|null} 非会话日志返回 null
 */
function generationOf(name) {
  const m = /^session(?:\.v(\d+))?\.jsonl(\.zstd)?$/.exec(name);
  if (!m) return null;
  return { gen: m[1] ? Number(m[1]) : 0, compressed: Boolean(m[2]) };
}

/**
 * 扫描会话根目录并聚合。
 * 目录层级实测为三层：<sessionsRoot>/<workspace>/<sessionId>/session[.vN].jsonl[.zstd]
 * （兼容工作区目录下直接放文件的形态）
 * @param {string} sessionsRoot 会话根目录
 * @param {{rates?:object, includeOtherProviders?:boolean, billingProviders?:string[], limit?:number, budgetMs?:number, cache?:Map, sinceMs?:number}} [options]
 *        cache 为一个可复用的 Map<file, {mtimeMs,size,signature,contribution}>：调用方跨次保留它，
 *        未变动的日志文件会被直接复用（filesReused 报告命中数），已变动的重算。
 *        sinceMs > 0 时只统计「最后一次写入在 sinceMs 之后」的会话（见 filesOutsideWindow）。
 */
export function aggregate(sessionsRoot, { rates = PRICE_TIERS, includeOtherProviders = false, billingProviders = OFFICIAL_PROVIDERS, channelRates = null, limit = Infinity, budgetMs = 0, cache = null, sinceMs = 0 } = {}) {
  const files = [];
  const listEntries = (p) => {
    try {
      return readdirSync(p, { withFileTypes: true }).map((e) => ({ path: join(p, e.name), name: e.name, dir: e.isDirectory() }));
    } catch {
      return [];
    }
  };
  if (existsSync(sessionsRoot)) {
    for (const ws of listEntries(sessionsRoot)) {
      if (!ws.dir) continue;
      for (const lvl2 of listEntries(ws.path)) {
        // 形态 A：<workspace>/<sessionDir>/<log>
        // 形态 B：<workspace>/<log>（工作区下直接放日志）
        const sessionId = lvl2.dir ? lvl2.name : lvl2.name.split('__')[0];
        const candidates = lvl2.dir ? listEntries(lvl2.path) : [lvl2];
        for (const c of candidates) {
          if (c.dir) continue;
          const generation = generationOf(c.name);
          if (!generation) continue; // session.lock、导出文件等一律不是会话日志
          let st;
          try { st = statSync(c.path); } catch { continue; }
          files.push({
            workspace: ws.name, sessionId, name: c.name, file: c.path,
            mtimeMs: st.mtimeMs, size: st.size, ...generation,
          });
        }
      }
    }
  }
  // 每个会话只保留最高代际；同代际（正常不会出现）先取压缩版，再取更新的那个。
  const newest = new Map();
  for (const f of files) {
    const key = `${f.workspace}/${f.sessionId}`;
    const prev = newest.get(key);
    if (!prev) { newest.set(key, f); continue; }
    const better = f.gen !== prev.gen
      ? f.gen > prev.gen
      : f.compressed !== prev.compressed
        ? f.compressed
        : f.mtimeMs > prev.mtimeMs;
    if (better) newest.set(key, f);
  }
  // 时间窗口：只看窗口内有写入的会话文件。日志按 mtime（最后一次写入）取舍 ——
  // 跨月仍在用的会话 mtime 是新的，照常进来；早已结束的老会话直接不读。
  // 这样「首次安装要看最近 30 天」不需要把全部历史解压一遍。
  const inWindow = sinceMs > 0 ? [...newest.values()].filter((f) => f.mtimeMs >= sinceMs) : [...newest.values()];
  const outsideWindow = newest.size - inWindow.length;
  const all = inWindow.sort((a, b) => b.mtimeMs - a.mtimeMs);
  const kept = all.slice(0, limit === Infinity ? undefined : limit);
  const skipped = all.slice(kept.length);

  const days = new Map();
  const daysThirdParty = new Map();
  // 工具调用（Search）按天：{ calls, cny }，与 token 金额分开统计
  const searchDays = new Map();
  const sessions = new Map();
  const models = new Map();
  const dayModels = new Map();
  const providerTotals = new Map();
  let calls = 0, unpriced = 0, unreadable = 0, reused = 0;
  let newestMtime = 0;

  // 缓存的键里必须带「计价口径」签名：费率/口径变了，旧的贡献就不能再用（否则改了设置不生效）。
  const signature = JSON.stringify([rates, includeOtherProviders, billingProviders, channelRates]);
  const contributionOpts = { rates, includeOtherProviders, billingProviders, channelRates };

  const merge = (c) => {
    for (const [k, v] of c.days) {
      if (!days.has(k)) days.set(k, blankBucket());
      mergeBucket(days.get(k), v);
    }
    for (const [k, v] of c.daysThirdParty ?? []) {
      if (!daysThirdParty.has(k)) daysThirdParty.set(k, blankBucket());
      mergeBucket(daysThirdParty.get(k), v);
    }
    for (const [k, v] of c.searchDays ?? []) {
      const cur = searchDays.get(k) ?? { calls: 0, cny: 0 };
      cur.calls += v.calls ?? 0;
      cur.cny += v.cny ?? 0;
      searchDays.set(k, cur);
    }
    for (const [k, v] of c.models) {
      if (!models.has(k)) models.set(k, blankBucket());
      mergeBucket(models.get(k), v);
    }
    for (const [k, v] of c.dayModels ?? []) {
      if (!dayModels.has(k)) dayModels.set(k, blankBucket());
      mergeBucket(dayModels.get(k), v);
    }
    for (const [k, v] of c.providers) {
      const t = providerTotals.get(k) ?? { calls: 0, tokens: 0, cny: 0 };
      t.calls += v.calls; t.tokens += v.tokens; t.cny += v.cny;
      providerTotals.set(k, t);
    }
    calls += c.calls;
    unpriced += c.unpriced;
    sessions.set(c.key, c.session);
  };

  // 时间预算：会话日志可能非常大（几十上百个文件、单个几百 MB），全量解压会把首屏拖到一分钟以上。
  // kept 已按 mtime 倒序（最新优先），所以超预算直接停手，保住"最近/今天"这部分数据。
  const deadline = budgetMs > 0 ? Date.now() + budgetMs : Infinity;
  let scanned = 0;
  let partialScan = false;

  for (const f of kept) {
    if (Date.now() > deadline) { partialScan = true; break; }
    scanned += 1;
    if (f.mtimeMs > newestMtime) newestMtime = f.mtimeMs;

    const cached = cache instanceof Map ? cache.get(f.file) : undefined;
    if (cached && cached.mtimeMs === f.mtimeMs && cached.size === f.size && cached.signature === signature) {
      reused += 1;
      merge(cached.contribution);
      continue;
    }

    let records;
    try {
      records = readSessionRecords(f.file);
    } catch (error) {
      // 读不出来的文件仍然出一个（空的）会话条目，与旧行为一致；但**不写缓存**，下次还会重试
      unreadable += 1;
      merge(contributionOf([], contributionOpts, f));
      continue;
    }
    const contribution = contributionOf(records, contributionOpts, f);
    if (cache instanceof Map) cache.set(f.file, { mtimeMs: f.mtimeMs, size: f.size, signature, contribution });
    merge(contribution);
  }

  return {
    generatedAt: Date.now(),
    sessionsRoot,
    filesScanned: scanned,
    filesReused: reused,
    filesOutsideWindow: outsideWindow,
    filesSkippedAsStale: skipped.map((f) => f.sessionId),
    unreadableFiles: unreadable,
    newestSourceMtime: newestMtime || null,
    partialScan,
    calls, unpricedCalls: unpriced,
    days: Object.fromEntries([...days.entries()].map(([k, v]) => [k, packBucket(v)])),
    // 非 DeepSeek 官方 provider 的按天贡献（宿主与官方用量合并时用）
    daysThirdParty: Object.fromEntries([...daysThirdParty.entries()].map(([k, v]) => [k, packBucket(v)])),
    // 工具调用（Search）单独计费：按北京日期 { calls, cny }，不并入 token 金额
    daysSearch: Object.fromEntries([...searchDays.entries()].map(([k, v]) => [k, {
      calls: v.calls,
      cny: Number(v.cny.toFixed(6)),
    }])),
    searchBilling: { tool: SEARCH_TOOL_NAME, ratePerThousand: 5, from: SEARCH_BILLING_FROM },
    sessions: Object.fromEntries([...sessions.entries()].map(([k, v]) => {
      const p = packBucket(v);
      return [k, {
        ...p,
        id: v.id, workspace: v.workspace, title: v.title, createdAt: v.createdAt,
        delegationDepth: v.delegationDepth, isSubagent: v.isSubagent,
        parentId: v.parentId, agentLabel: v.agentLabel,
      }];
    })),
    models: Object.fromEntries([...models.entries()].map(([k, v]) => [k, packBucket(v)])),
    // 键为 `${北京日期}|${provider} | ${model}`；用于按时间窗口查看/导出模型明细
    dayModels: Object.fromEntries([...dayModels.entries()].map(([k, v]) => [k, packBucket(v)])),
    providers: Object.fromEntries([...providerTotals.entries()].map(([k, v]) => [k, {
      calls: v.calls, tokens: v.tokens, cny: Number(v.cny.toFixed(6)),
    }])),
  };
}

/** 取某个时间点（默认现在）的北京日期键 */
export const todayKey = (now = Date.now()) => dayKeyOf(now);

/** 把聚合结果裁剪到只看最近 N 天（含今天），用于 7/30 天视图 */
export function sliceDays(summary, days, now = Date.now()) {
  const keys = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    keys.push(dayKeyOf(d.getTime()));
  }
  return keys.map((k) => ({ day: k, ...(summary.days[k] ?? null) }));
}
