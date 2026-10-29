/**
 * 渲染闸门：用「有数据」的状态把整棵面板树渲染一遍（不落 DOM、不比像素）。
 * 抓的是"只有数据分支才炸"的渲染期异常 —— 真实事故：趋势轴标签的 map 缺 index → 整面板白屏。
 * 验收（spec 001 AC2）：故意去掉轴标签 map 的 `, index` 时，本脚本必须非零退出。
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const code = readFileSync(join(here, '..', 'lib', 'client.js'), 'utf8');

const RATES = { cacheHit: 0.02, cacheMiss: 1, output: 4 };
const READY = {
  today: '2026-10-15', meterSource: 'official', peakNow: false, partialScan: false,
  billingUrl: 'https://platform.deepseek.com/usage', sessionsRoot: '/tmp/dsh-sessions',
  filesScanned: 3, filesReused: 1, filesOutsideWindow: 2, elapsedMs: 12, generatedAt: Date.now(),
  officialProviders: ['deepseek-official', 'deepseek-account'],
  config: {
    dailyBudget: 50, alertAtPercent: 80, showBalance: true, lowBalanceAlert: 20, refreshSeconds: 60,
    channelRates: { 'pi-ai': { 'glm-5.3': { cacheHit: 2, cacheMiss: 8, output: 28 } } },
    rates: {
      peak: { 'deepseek-flash': RATES, 'deepseek-v4-pro': RATES },
      offPeak: { 'deepseek-flash': RATES, 'deepseek-v4-pro': RATES },
    },
  },
  days: {
    '2026-10-15': {
      hit: 41e6, miss: 2.5e5, out: 2.3e5, calls: 187, cny: 2.01, hitRate: 99.4,
      // token 均匀分布、花费集中在 10 点：两个视角的分时柱高必须不同
      byHour: new Array(24).fill(1e6),
      byHourCny: Array.from({ length: 24 }, (_, hour) => (hour === 10 ? 1.0 : (2.01 - 1.0) / 23)),
      peakCalls: 0,
      tier: { peak: { cny: 0, calls: 0 }, offPeak: { cny: 2.01, calls: 187 } },
    },
    // 第二天：花费 / token 的比值与今天不同 —— 两个视角的趋势折线形状必须不同
    '2026-10-14': {
      hit: 10e6, miss: 1e6, out: 1e6, calls: 90, cny: 1.0, hitRate: 90.9,
      byHour: new Array(24).fill(0), byHourCny: new Array(24).fill(1.0 / 24), peakCalls: 10,
      tier: { peak: { cny: 0, calls: 0 }, offPeak: { cny: 1.0, calls: 90 } },
    },
  },
  // 第三方渠道贡献（用于「渠道拆分」卡与明细窗口内的 provider 汇总）
  daysThirdParty: {
    '2026-10-15': { hit: 1e6, miss: 1e5, out: 1e5, calls: 5, cny: 0.4, byHour: new Array(24).fill(0), byHourCny: new Array(24).fill(0) },
  },
  // 工具调用（Search）单独计费：11/1 前免费，只记成功调用次数
  daysSearch: {
    '2026-10-15': { calls: 3, cny: 0 },
    '2026-10-14': { calls: 5, cny: 0.025 },
  },
  providers: {
    'deepseek-official': { calls: 120, tokens: 26.16e6, cny: 1.15 },
    'deepseek-account': { calls: 67, tokens: 15.18e6, cny: 0.86 },
    'pi-ai': { calls: 5, tokens: 1.2e6, cny: 0.4 },
  },
  dayModels: {
    // 官方两条并列：账号登录（账号额度）与 API Key（不占账号额度）必须分开渲染
    '2026-10-15|deepseek-official | deepseek-flash': { hit: 26e6, miss: 1.6e5, out: 1.5e5, calls: 120, cny: 1.15 },
    '2026-10-15|deepseek-account | deepseek-flash': { hit: 15e6, miss: 9e4, out: 8e4, calls: 67, cny: 0.86 },
    '2026-10-15|pi-ai | glm-5.3': { hit: 1e6, miss: 1e5, out: 1e5, calls: 5, cny: 0.4 },
  },
  official: {
    ok: true, auth: 'account', requests: 187, cny: 2.01, yesterdayCny: 9.6,
    days: { '2026-10-15': 2.01, '2026-10-14': 9.6 },
  },
  sessions: [{ id: 's1', title: '会话', cny: 1.2, calls: 20, hit: 3e6, miss: 1e4, out: 2e4, at: Date.now(), isSubagent: false }],
};

const NO_BUDGET = {
  ...READY,
  config: { ...READY.config, dailyBudget: 0, monthlyBudget: 0 },
  localDays: READY.days,
};
/** 旧宿主没有 byHourCny（全 0）：客户端要按 token 占比回退，不能崩 */
const NO_HOUR = {
  ...READY,
  days: {
    '2026-10-15': { ...READY.days['2026-10-15'], byHourCny: undefined, byHour: new Array(24).fill(0) },
  },
};
let ACTIVE = READY;
let FORCED_VIEW = null;
/** 首屏 loading 分支（骨架屏）也必须能渲染：曾因骨架引用未初始化的皮肤对象而崩溃 */
let FORCED_LOADING = false;
/** 明细窗口状态在真实面板里由 chip 切换；闸门逐个窗口渲染，覆盖所有分支 */
let FORCED_DETAIL = null;
/** 趋势/分时的查看口径（初值 'cny'）：闸门也渲染一次 Token 视角，覆盖另一个分支 */
let FORCED_METRIC = null;
/** 悬浮状态（初值 -1）：闸门强制 hover，覆盖 tooltip 渲染分支；null = 不悬浮 */
let FORCED_HOVER = null;
let hoverStateIndex = 0;

const React = {
  createElement: (type, props, ...children) => ({
    type,
    props: props || {},
    children: children.flat(Infinity).filter((c) => c !== null && c !== undefined && c !== false),
  }),
  // 数据类状态（{status,data}）直接落成 ready 数据；其余保持原值
  useState: (init) => {
    // 视图状态（初值 'overview'）在渲染门禁里强制切换，覆盖三个视图分支
    if (init === 'overview') return [FORCED_VIEW ?? 'overview', () => {}];
    // 明细窗口状态（初值 'today'）同样逐个强制，覆盖 近7天/近30天/月/季/年 分支
    if (init === 'today') return [FORCED_DETAIL ?? 'today', () => {}];
    // 查看口径（初值 'cny'）强制切一次，覆盖 Token 视角分支
    if (init === 'cny') return [FORCED_METRIC ?? 'cny', () => {}];
    // 悬浮状态（初值 -1）：trend / hour 两个状态按 hook 顺序区分，强制出 tooltip 分支
    if (init === -1) {
      hoverStateIndex += 1;
      const forced = FORCED_HOVER ?? { trend: -1, hour: -1 };
      return [hoverStateIndex === 1 ? forced.trend : forced.hour, () => {}];
    }
    const value = typeof init === 'function' ? init() : init;
    if (value && typeof value === 'object' && 'status' in value && 'data' in value) {
      if (FORCED_LOADING) return [{ status: 'loading', data: null, error: null, at: 0, refresh() {}, reload() {} }, () => {}];
      return [{
        ...value, status: 'ready', data: ACTIVE, error: null, at: Date.now(),
        refresh() {}, reload() {},
      }, () => {}];
    }
    return [value, () => {}];
  },
  useEffect: () => {}, useLayoutEffect: () => {},
  useRef: (v) => ({ current: v }),
  useMemo: (fn) => fn(),
  useCallback: (fn) => fn,
  Fragment: 'fragment',
};

let entry = null;
globalThis.window = { __ModuleLoader__: { load: (e) => { entry = e; } } };
new Function(code)();
if (!entry) {
  console.error('FAIL: bundle 没有注册模块');
  process.exit(1);
}

let panel = null;
const cleanups = [];
const mod = entry.factory((name) => {
  if (name === 'react') return React;
  throw new Error(`unexpected require: ${name}`);
});
mod.apply({
  slots: {
    inject: (key, cb) => cb(),
    register: (spec, component) => {
      if (spec.name === 'main') panel = component;
      return () => {};
    },
  },
  locale: { register: () => () => {} },
  effect: (cb) => { cleanups.push(cb()); return () => {}; },
});
if (!panel) {
  console.error('FAIL: 没有注册 main 面板组件');
  process.exit(1);
}

let visited = 0;
/** 收集渲染树里出现的文本：翻译函数在闸门里返回 key，可用来断言文案真的渲染了 */
let seenText = new Set();
/** 收集 SVG 折线/面积的点串：花费视角与 Token 视角的纵轴不同，点串必须不同 */
let seenPoints = new Set();
/** 收集分时柱高度（key 为 0..23 的柱）：两个视角必须按各自的分时数组重算 */
let seenBars = new Set();
const walk = (node) => {
  if (node === null || node === undefined || node === false || node === true) return;
  if (Array.isArray(node)) { node.forEach(walk); return; }
  if (typeof node === 'string' || typeof node === 'number') { seenText.add(String(node)); return; }
  if (typeof node !== 'object') return;
  visited += 1;
  const { type, props } = node;
  if (props && typeof props.points === 'string') seenPoints.add(props.points);
  if (props && typeof props.key === 'number' && props.key >= 0 && props.key <= 23
    && props.style && typeof props.style.height === 'string') {
    seenBars.add(props.style.height);
  }
  if (typeof type === 'function') { walk(type({ ...props, children: node.children, t: (k) => k, useProjection: undefined })); return; }
  walk(node.children);
};

let totalVisited = 0;
/** 跑一次面板渲染，重置计数器/收集容器（含悬浮状态在 hook 顺序里的计数） */
const runWalk = () => {
  hoverStateIndex = 0;
  visited = 0;
  seenText = new Set();
  seenPoints = new Set();
  seenBars = new Set();
  walk(panel({ t: (k) => k, useProjection: undefined }));
  totalVisited += visited;
};
const DETAIL_RANGES = ['today', '7d', '30d', 'month', 'quarter', 'year'];
/** 花费视角的折线点串 / 分时柱高：Token 视角必须重算，否则两个视角图形一样 */
let costModePoints = new Set();
let costModeBars = new Set();
try {
  for (const view of ['overview', 'detail', 'export']) {
    FORCED_VIEW = view;
    ACTIVE = READY;
    const ranges = view === 'detail' ? DETAIL_RANGES : [null];
    for (const detailRange of ranges) {
      FORCED_DETAIL = detailRange;
      runWalk();
      if (view === 'overview') {
        // 花费视角的峰值文案按金额（Token 视角会变成 tokens，见下面断言）
        const peakCaption = [...seenText].find((s) => s.includes('peakHourLabel'));
        if (!peakCaption || !peakCaption.includes('¥')) {
          console.error(`FAIL: 花费视角的分时峰值文案没有按金额展示（实际 ${JSON.stringify(peakCaption)}）`);
          process.exit(1);
        }
        costModePoints = new Set(seenPoints);
        costModeBars = new Set(seenBars);
        // 渠道拆分：账号额度与 API Key 必须各占一行；合并回「官方渠道」一行时这里会变红
        for (const key of ['accountQuota', 'apiKeyQuota']) {
          if (!seenText.has(key)) {
            console.error(`FAIL: 渠道拆分没有把官方渠道按「账号额度 / API Key」拆开（缺 ${key}）`);
            process.exit(1);
          }
        }
        // 工具调用（Search）单独计费的一行也必须在（去掉这行或并进 token 金额时这里会变红）
        if (!seenText.has('toolSearchRow')) {
          console.error('FAIL: 渠道拆分缺少「工具调用 Search」单独计费的一行');
          process.exit(1);
        }
        // 趋势 / 分时图的「花费 / Token」视角切换必须在（删掉切换 chip 时这里变红）
        for (const key of ['viewCost', 'viewTokens']) {
          if (!seenText.has(key)) {
            console.error(`FAIL: 趋势/分时缺少「花费 / Token」视角切换（缺 ${key}）`);
            process.exit(1);
          }
        }
      }
    }
  }
  // Token 视角分支：两张图改按 token 口径渲染，且必须真的换口径（不能只是渲染不炸）
  FORCED_VIEW = 'overview';
  FORCED_METRIC = 'tokens';
  runWalk();
  const tokenPeak = [...seenText].find((s) => s.includes('peakHourLabel'));
  if (!tokenPeak || !tokenPeak.includes('tokens')) {
    console.error(`FAIL: Token 视角的分时峰值文案没有换成 token（实际 ${JSON.stringify(tokenPeak)}）`);
    process.exit(1);
  }
  if (JSON.stringify([...seenPoints]) === JSON.stringify([...costModePoints])) {
    console.error('FAIL: 趋势折线在两个视角下点串相同 —— metric 没有接到趋势纵轴');
    process.exit(1);
  }
  if (JSON.stringify([...seenBars]) === JSON.stringify([...costModeBars])) {
    console.error('FAIL: 分时柱在两个视角下高度相同 —— metric 没有接到分时数组');
    process.exit(1);
  }
  FORCED_METRIC = null;
  FORCED_DETAIL = null;
  // 悬浮提示：强制 hover 后 tooltip 内容必须真的渲染（日期、金额、精确 token、命中构成、点击提示）
  ACTIVE = READY;
  FORCED_HOVER = { trend: 1, hour: 10 };
  runWalk();
  const tipHead = [...seenText].find((s) => s.startsWith('2026-10-15 · '));
  const hasExactTokens = [...seenText].some((s) => /^\d{1,3}(,\d{3})+$/.test(s));
  if (!tipHead || !seenText.has('totalTokens') || !hasExactTokens || !seenText.has('clickForSplit')) {
    console.error(`FAIL: 悬浮提示没有渲染（head=${JSON.stringify(tipHead)} exact=${hasExactTokens}）`);
    process.exit(1);
  }
  if (!seenText.has('¥2.01')) {
    console.error('FAIL: 悬浮提示里没有当天花费');
    process.exit(1);
  }
  // 旧数据没有 byHourCny：分时花费回退不能崩，且无数据时峰值文案显示「—」
  ACTIVE = NO_HOUR;
  FORCED_HOVER = { trend: 0, hour: 10 };
  runWalk();
  if (!seenText.has('peakHourLabel —') || !seenText.has('¥0.00')) {
    console.error('FAIL: 缺少 byHourCny 时回退渲染不正确');
    process.exit(1);
  }
  FORCED_HOVER = null;
  ACTIVE = READY;
  // 首屏 loading（骨架屏）分支
  FORCED_LOADING = true;
  FORCED_VIEW = 'overview';
  runWalk();
  FORCED_LOADING = false;
  // 无预算（只记录花费）分支
  FORCED_VIEW = 'overview';
  ACTIVE = NO_BUDGET;
  runWalk();
} catch (error) {
  console.error(`FAIL: 有数据状态渲染抛错 -> ${error?.message ?? error}`);
  console.error(String(error?.stack ?? '').split('\n').slice(1, 5).join('\n'));
  process.exit(1);
}
console.log(`data-state render OK（三视图 + 无预算，遍历 ${totalVisited} 个节点）`);
for (const cleanup of cleanups) {
  try { cleanup?.(); } catch { /* ignore */ }
}
if (totalVisited < 500) {
  console.error(`FAIL: 覆盖不足（只遍历到 ${totalVisited} 个节点，期望 > 500）`);
  process.exit(1);
}
console.log('RENDER GATE OK');
