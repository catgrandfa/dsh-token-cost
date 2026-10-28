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
  config: {
    dailyBudget: 50, alertAtPercent: 80, showBalance: true, lowBalanceAlert: 20, refreshSeconds: 60,
    rates: {
      peak: { 'deepseek-flash': RATES, 'deepseek-v4-pro': RATES },
      offPeak: { 'deepseek-flash': RATES, 'deepseek-v4-pro': RATES },
    },
  },
  days: {
    '2026-10-15': {
      hit: 41e6, miss: 2.5e5, out: 2.3e5, calls: 187, cny: 2.01, hitRate: 99.4,
      byHour: new Array(24).fill(1e6), peakCalls: 0,
      tier: { peak: { cny: 0, calls: 0 }, offPeak: { cny: 2.01, calls: 187 } },
    },
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
let ACTIVE = READY;
let FORCED_VIEW = null;
/** 明细窗口状态在真实面板里由 chip 切换；闸门逐个窗口渲染，覆盖所有分支 */
let FORCED_DETAIL = null;

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
    const value = typeof init === 'function' ? init() : init;
    if (value && typeof value === 'object' && 'status' in value && 'data' in value) {
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
const walk = (node) => {
  if (node === null || node === undefined || node === false || node === true) return;
  if (Array.isArray(node)) { node.forEach(walk); return; }
  if (typeof node !== 'object') return;
  visited += 1;
  const { type, props } = node;
  if (typeof type === 'function') { walk(type({ ...props, t: (k) => k, useProjection: undefined })); return; }
  walk(node.children);
};

let totalVisited = 0;
const DETAIL_RANGES = ['today', '7d', '30d', 'month', 'quarter', 'year'];
try {
  for (const view of ['overview', 'detail', 'export']) {
    FORCED_VIEW = view;
    ACTIVE = READY;
    const ranges = view === 'detail' ? DETAIL_RANGES : [null];
    for (const detailRange of ranges) {
      FORCED_DETAIL = detailRange;
      visited = 0;
      walk(panel({ t: (k) => k, useProjection: undefined }));
      totalVisited += visited;
    }
  }
  FORCED_DETAIL = null;
  // 无预算（只记录花费）分支
  FORCED_VIEW = 'overview';
  ACTIVE = NO_BUDGET;
  visited = 0;
  walk(panel({ t: (k) => k, useProjection: undefined }));
  totalVisited += visited;
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
