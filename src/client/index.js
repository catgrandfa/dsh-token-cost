import React from 'react';

/**
 * token-cost 浏览器半侧：DSH 侧栏入口 + 中栏独立面板。
 *
 * 数据来源（两者结合，按用户确认的口径）：
 *   1. 全量日志聚合：GET /token-cost/summary （宿主半侧扫描 ~/.dsh/sessions 得到
 *      今日 / 7天 / 30天 / 按会话明细，这是「按天历史」唯一的来源）
 *   2. 当前会话实时用量：useProjection('tokenUsage') （官方 token 计量投影，
 *      数值随会话事件流自动更新，用来在面板底部显示「本会话实时」小块）
 *
 * 样式：只用 DSH 自己的 --dsw-* 主题变量，因此在深浅色主题下都跟界面一致。
 */

/**
 * 包名在**构建期**注入（tools/build-client.mjs 的 define），由此派生侧栏 slot id、
 * 路由前缀与 locale 命名空间。与上游 dsh-token-meter-panel 保持不同标识，
 * 两个插件可以同时安装在一个 profile 里而不会重复注册。
 */
const PKG_NAME = typeof __DSH_PLUGIN_NAME__ === 'string' ? __DSH_PLUGIN_NAME__ : 'dsh-token-cost';
const SHORT_NAME = PKG_NAME.replace(/^dsh-/, '');
const SLOT_ID = SHORT_NAME.replace(/-/g, '');
const ROUTE_BASE = `/${SHORT_NAME}`;
const LOCALE_NS = SHORT_NAME;
const ROUTE = `${ROUTE_BASE}/summary`;

/* ------------------------------------------------------------------ *
 * 文案
 * ------------------------------------------------------------------ */
const zh = {
  'nav': 'Token 花费',
  'title': 'Token 花费',
  'subtitle': 'DeepSeek · 本机估算',
  'today': '今日消费',
  'peak': '高峰时段计价',
  'offpeak': '空闲档 · 半价',
  'vsPrev': 'vs 上次使用',
  'budgetUsed': '预算',
  'used': '已用',
  'remain': '剩余',
  'balance': '账户余额',
  'checkBalance': '查询余额',
  'balanceLoading': '查询中…',
  'balanceAccount': '账号',
  'balanceApiKey': 'API Key',
  'inclGranted': '含赠送',
  'peakHourLabel': '峰值',
  'peakShort': '高峰',
  'offShort': '空闲',
  'currentTier': '当前时段',
  'officialLabel': '官方',
  'localShort': '本地日志',
  'yesterdayLabel': '昨天',
  'historyTitle': '历史（按天）',
  'autoSession': '浏览器登录态',
  'notConnected': '未连接（可选）',
  'totalSpent': '累计消费',
  'lowBalance': '余额偏低，低于',
  'lowBalanceHint': '点击直接改（写回 DSH 设置），0 = 关闭提醒',
  'editBudgetHint': '点击直接改每日预算（写回 DSH 设置）',
  'editLowHint': '点击修改',
  'save': '保存',
  'cancel': '取消',
  'rechargeHint': '建议充值',
  'windowToday': '今日',
  'window7': '近 7 天',
  'window30': '近 30 天',
  'windowMonth': '本月',
  'authAccount': '账号登录态',
  'authBrowser': '浏览器登录态',
  'timesShort': '次',
  'totalTokens': '总 token',
  'perCall': '单次花费',
  'perCallHint': '今日消费 ÷ 调用次数，单位：元/次',
  'composeTitle': '总 token 构成',
  'colItem': '项目',
  'colPrice': '单价 现/峰',
  'colUsage': '用量',
  'colSubtotal': '小计',
  'todayTotal': '今日合计',
  'tierOffShort': '空闲档',
  'byLocalTier': '本机日志分档（口径同本地扫描）',
  'tierPeakShort': '高峰档',
  'rateFootnote': '单价：元/百万 token（按 flash 档展示）。行小计 = 官方用量 × 当前档单价，四舍五入到分，与官方账单允许几分差异。',
  'totalSpentHint': '账号开通以来的官方累计消费（走账号授权，不需要网页登录）',
  'notConnectedChrome': '未连接 · 需登录 platform.deepseek.com',
  'noBrowser': '未检测到 Chrome/Edge（可选）',
  'officialLoading': '正在获取官方数据…',
  'firstLoad': '首次加载，请稍等',
  'firstLoadHint': '（要读浏览器登录态并扫描本机会话日志，通常几秒）',
  'sumLabel': '合计',
  'fromOfficial': '官方',
  'tierFromLocal': '峰/谷按本机日志分档',
  'byCurrentTier': '按当前时段单价',
  'licenseLabel': '开源协议',
  'updateAvailable': '有新版本',
  'updateAuto': '后台自动更新中（重启 DSH 生效）',
  'updateRunning': '正在后台更新…',
  'updateApplied': '已后台更新完成，重启 DSH 生效',
  'updateFailed': '后台更新失败（缺 pnpm？）',
  'copyCmd': '复制更新命令',
  'copied': '已复制 ✓',
  'viewRelease': '发布说明',
  'connectOfficial': '连接',
  'connectHint': '官方用量是可选的对账数据：在 Chrome/Edge 或 DSH 内置浏览器里登录 platform.deepseek.com 后自动读取（Safari/Firefox 读不到，macOS 沙盒限制）。余额与本地花费不需要它',
  'localEstimate': '本地推算',
  'diffLabel': '差',
  'officialOff': '官方用量已关闭',
  'officialNoToken': '未配置 Platform userToken',
  'billingLink': '官方账单页',
  'tierTitle': '峰谷价',
  'peakWindow': '高峰：周一至周五 9:00-12:00、14:00-18:00（北京时间）',
  'rangeCustom': '自定义',
  'unitPrices': '计费单价（元/百万 token）',
  'warnLine': '告警线',
  'rateDetail': '计费明细',
  'vsPrevOn': '较',
  'notEnabled': '未开启',
  'balanceFailed': '查询失败',
  'fewDays': '更早没有记录',
  'showAllSessions': '查看全部',
  'collapseSessions': '收起',
  'missInput': '未命中输入',
  'hitInput': '缓存命中输入',
  'output': '输出',
  'hitRate': '缓存命中率',
  'calls': '次调用',
  'trend': '每日消费趋势',
  'byHour': '今日分时用量',
  'costSplit': '今日成本构成',
  'clickForSplit': '点击可看当天成本构成',
  'byAmount': '按金额占比',
  'sessions': '今日按会话明细',
  'session': '会话',
  'lastCall': '最近调用',
  'callsShort': '调用',
  'cost': '消费',
  'share': '占比',
  'subagent': '子代理',
  'zeroDays': '无调用',
  'noData': '还没有用量记录',
  'noDataHint': '这个会话或本机还没有产生 DeepSeek 官方计费的调用。',
  'loading': '读取用量…',
  'failed': '读取失败',
  'retry': '重试',
  'refresh': '刷新',
  'auto': '自动刷新',
  'live': '本会话实时',
  'liveHint': '来自官方 tokenUsage 投影，随对话即时更新',
  'overBudget': '已超预算',
  'peakNow': '当前为高峰时段（双倍价）',
  'offNow': '当前为空闲时段（半价）',
  'range7': '近 7 天',
  'range30': '近 30 天',
  'source': '数据源',
  'updated': '更新于',
  'partial': '当前会话仍在写入，今日数字是下界',
  'scanning': '正在补扫历史…',
  'rateLine': '计费口径',
};

const en = {
  'nav': 'Token cost',
  'title': 'Token cost',
  'subtitle': 'DeepSeek · local estimate',
  'today': 'Spent today',
  'peak': 'peak-hour pricing',
  'offpeak': 'off-peak · half price',
  'vsPrev': 'vs last use',
  'budgetUsed': 'Budget',
  'used': 'used',
  'remain': 'left',
  'balance': 'Balance',
  'checkBalance': 'Check balance',
  'balanceLoading': 'loading…',
  'balanceAccount': 'account',
  'balanceApiKey': 'API Key',
  'inclGranted': 'incl. bonus',
  'peakHourLabel': 'peak',
  'peakShort': 'Peak',
  'offShort': 'Off-peak',
  'currentTier': 'Current period',
  'officialLabel': 'Official',
  'localShort': 'local log',
  'yesterdayLabel': 'yesterday',
  'historyTitle': 'History (daily)',
  'autoSession': 'browser session',
  'notConnected': 'not connected (optional)',
  'totalSpent': 'Total spent',
  'lowBalance': 'Low balance, below',
  'lowBalanceHint': 'Click to edit (writes back to DSH settings); 0 disables',
  'editBudgetHint': 'Click to edit the daily budget',
  'editLowHint': 'edit',
  'save': 'Save',
  'cancel': 'Cancel',
  'rechargeHint': 'top up',
  'windowToday': 'Today',
  'window7': 'Last 7d',
  'window30': 'Last 30d',
  'windowMonth': 'This month',
  'authAccount': 'account session',
  'authBrowser': 'browser session',
  'timesShort': 'calls',
  'totalTokens': 'Total tokens',
  'perCall': 'Per call',
  'perCallHint': "today's cost ÷ calls (CNY per call)",
  'composeTitle': 'Token mix',
  'colItem': 'Item',
  'colPrice': 'Price',
  'colUsage': 'Usage',
  'colSubtotal': 'Subtotal',
  'todayTotal': 'Today total',
  'tierOffShort': 'Off-peak',
  'byLocalTier': 'Local-log tier split',
  'tierPeakShort': 'Peak',
  'rateFootnote': 'Unit price: CNY per million tokens (flash tier shown). Subtotal = official usage × current-tier price, rounded to cents; small differences vs the official bill are expected.',
  'totalSpentHint': 'official lifetime spend on this account (account grant, no web sign-in needed)',
  'notConnectedChrome': 'not connected · sign in at platform.deepseek.com',
  'noBrowser': 'no Chrome/Edge detected (optional)',
  'officialLoading': 'fetching official data…',
  'firstLoad': 'First load, please wait',
  'firstLoadHint': '(reading browser session and scanning local session logs — usually a few seconds)',
  'sumLabel': 'Total',
  'fromOfficial': 'official',
  'tierFromLocal': 'peak/off-peak split from local logs',
  'byCurrentTier': 'at the current tier price',
  'licenseLabel': 'license',
  'updateAvailable': 'update available',
  'updateAuto': 'auto-updating in background (restart DSH)',
  'updateRunning': 'updating in background…',
  'updateApplied': 'updated in background — restart DSH',
  'updateFailed': 'background update failed (pnpm missing?)',
  'copyCmd': 'copy update command',
  'copied': 'copied ✓',
  'viewRelease': 'release notes',
  'connectOfficial': 'Connect',
  'connectHint': 'Optional cross-check: sign in at platform.deepseek.com in Chrome/Edge — the session is read automatically (Safari/Firefox unsupported). Balance and local cost do not need it',
  'localEstimate': 'local estimate',
  'diffLabel': 'diff',
  'officialOff': 'Official usage is off',
  'officialNoToken': 'Platform userToken not configured',
  'billingLink': 'Official billing page',
  'tierTitle': 'Peak / off-peak rates',
  'peakWindow': 'Peak: Mon-Fri 09:00-12:00, 14:00-18:00 (Beijing time)',
  'rangeCustom': 'Custom',
  'unitPrices': 'Unit prices (CNY per million tokens)',
  'notEnabled': 'off',
  'balanceFailed': 'lookup failed',
  'warnLine': 'Alert line',
  'rateDetail': 'Rate detail',
  'vsPrevOn': 'vs',
  'fewDays': 'no earlier records',
  'showAllSessions': 'Show all',
  'collapseSessions': 'Collapse',
  'missInput': 'Uncached input',
  'hitInput': 'Cached input',
  'output': 'Output',
  'hitRate': 'Cache hit rate',
  'calls': 'calls',
  'trend': 'Daily spend',
  'byHour': 'Today by hour',
  'costSplit': 'Cost breakdown today',
  'clickForSplit': 'Click a bar to see that day',
  'byAmount': 'share by cost',
  'sessions': 'Today by session',
  'session': 'Session',
  'lastCall': 'Last call',
  'callsShort': 'Calls',
  'cost': 'Cost',
  'share': 'Share',
  'subagent': 'subagent',
  'zeroDays': 'no calls',
  'noData': 'No usage recorded yet',
  'noDataHint': 'No DeepSeek-billed calls have been recorded yet.',
  'loading': 'Loading usage…',
  'failed': 'Failed to load',
  'retry': 'Retry',
  'refresh': 'Refresh',
  'auto': 'Auto refresh',
  'live': 'This session',
  'liveHint': 'Live from the official tokenUsage projection',
  'overBudget': 'over budget',
  'peakNow': 'Peak hours now (double price)',
  'offNow': 'Off-peak now (half price)',
  'range7': '7 days',
  'range30': '30 days',
  'source': 'Source',
  'updated': 'Updated',
  'partial': 'This session is still appending; today is a lower bound',
  'scanning': 'backfilling history…',
  'rateLine': 'Pricing',
};

/* ------------------------------------------------------------------ *
 * 小组件
 * ------------------------------------------------------------------ */
const fmt = (n) => {
  const v = Number(n) || 0;
  if (v >= 1e6) return (v / 1e6).toFixed(v / 1e6 >= 10 ? 1 : 2) + 'M';
  if (v >= 1e3) return (v / 1e3).toFixed(v / 1e3 >= 10 ? 0 : 1) + 'K';
  return String(Math.round(v));
};
/** 一律用 M（百万）为单位，便于把「按 M × 单价」的算式对齐看懂 */
const fmtM = (n) => {
  const v = Number(n) || 0;
  if (v >= 1e7) return (v / 1e6).toFixed(1) + 'M';
  if (v >= 1e6) return (v / 1e6).toFixed(2) + 'M';
  if (v >= 1e3) return (v / 1e6).toFixed(3) + 'M';
  return (v / 1e6).toFixed(4) + 'M';
};
const money = (n) => '¥' + (Number(n) || 0).toFixed(2);
const pct = (a, b) => (b > 0 ? (100 * a) / b : 0);
const hhmm = (ms) => {
  if (!ms) return '—';
  const d = new Date(ms + 8 * 3600e3);
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
};
const clock = (ms) => new Date(ms).toTimeString().slice(0, 8);

/**
 * 金额显示：官方平台给的是 16 位小数的十进制字符串（如 91.2898273800000000），
 * 原样贴出来没法看。按量级收敛到 2/4/6 位，极小金额不四舍五入成 0.00。
 * 原始字符串仍可通过 tooltip 看到。
 */
function fmtMoney(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value ?? '—');
  if (n === 0) return '0.00';
  const abs = Math.abs(n);
  const digits = abs >= 0.01 ? 2 : abs >= 0.0001 ? 4 : 6;
  return n.toFixed(digits);
}

const C = {
  // 三色（方案 B：青绿 / 琥珀 / 靛蓝）—— 色相 165°/35°/245°，两两间隔 ≥80°，
  // 图例 9px 小色块并排也能一眼分开；绿=命中省钱、琥珀=未命中花钱，语义直觉一致。
  // 浅色主题对应值（#0D9488 / #B45309 / #4F46E5）待接入主题检测后切换。
  hit: '#2DD4BF',
  miss: '#F59E0B',
  out: '#818CF8',
  warn: 'var(--dsw-alias-state-warn-primary, #e3b341)',
  error: 'var(--dsw-alias-state-error-primary, #f85149)',
  ok: 'var(--dsw-alias-state-success-primary, #3fb950)',
  label: 'var(--dsw-alias-label-primary, #1f2329)',
  label2: 'var(--dsw-alias-label-secondary, #5a6472)',
  label3: 'var(--dsw-alias-label-tertiary, #8a94a6)',
  border: 'var(--dsw-alias-border-l2, rgba(128,128,128,.25))',
  border1: 'var(--dsw-alias-border-l1, rgba(128,128,128,.16))',
  layer1: 'var(--dsw-alias-bg-layer-1, rgba(128,128,128,.06))',
  layer2: 'var(--dsw-alias-bg-layer-2, rgba(128,128,128,.10))',
  brand: 'var(--dsw-alias-brand-primary, #2f7dff)',
};
const card = {
  border: `1px solid ${C.border1}`,
  borderRadius: 12,
  background: C.layer1,
  padding: '12px 13px',
  marginTop: 12,
};

/* ------------------------------------------------------------------ *
 * 皮肤（0.3）：皮肤 = 一组「表面 token」，几何字面量写死，颜色一律基于 --dsw-*
 *   变换（color-mix），所以深浅主题都跟着走；文字与语义色（命中/未命中/输出）
 *   不参与皮肤化，保证任何皮肤下金额都足够清晰、三色仍可区分。
 * ------------------------------------------------------------------ */
const GLASS_BLUR = 'blur(22px) saturate(170%)';
const SKINS = {
  default: {
    card: { ...card },
    hero: {
      border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px',
      background: 'var(--dsw-alias-bg-layer-2, rgba(47,125,255,.06))',
    },
    panel: { border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px', background: C.layer1 },
    stat: { border: `1px solid ${C.border1}`, borderRadius: 12, background: C.layer1 },
  },
  glass: {
    card: {
      border: '1px solid color-mix(in srgb, var(--dsw-alias-label-primary) 13%, transparent)',
      borderRadius: 16,
      padding: '12px 13px',
      marginTop: 12,
      background: 'color-mix(in srgb, var(--dsw-alias-bg-layer-1) 50%, transparent)',
      backdropFilter: GLASS_BLUR,
      WebkitBackdropFilter: GLASS_BLUR,
      boxShadow: '0 10px 32px rgba(0,0,0,.22), inset 0 1px 0 color-mix(in srgb, #fff 20%, transparent)',
    },
    hero: {
      // 与 panel 完全同款：三栏必须同圆角同阴影，否则会"不在一个平面"
      border: '1px solid color-mix(in srgb, var(--dsw-alias-label-primary) 13%, transparent)',
      borderRadius: 16,
      padding: '14px 16px',
      background: 'color-mix(in srgb, var(--dsw-alias-bg-layer-1) 50%, transparent)',
      backdropFilter: GLASS_BLUR,
      WebkitBackdropFilter: GLASS_BLUR,
      boxShadow: '0 14px 40px rgba(0,0,0,.24), inset 0 1px 0 color-mix(in srgb, #fff 24%, transparent)',
    },
    panel: {
      border: '1px solid color-mix(in srgb, var(--dsw-alias-label-primary) 13%, transparent)',
      borderRadius: 16,
      padding: '14px 16px',
      background: 'color-mix(in srgb, var(--dsw-alias-bg-layer-1) 50%, transparent)',
      backdropFilter: GLASS_BLUR,
      WebkitBackdropFilter: GLASS_BLUR,
      boxShadow: '0 10px 32px rgba(0,0,0,.22), inset 0 1px 0 color-mix(in srgb, #fff 20%, transparent)',
    },
    stat: {
      border: '1px solid color-mix(in srgb, var(--dsw-alias-label-primary) 11%, transparent)',
      borderRadius: 14,
      background: 'color-mix(in srgb, var(--dsw-alias-bg-layer-1) 58%, transparent)',
      boxShadow: 'inset 0 1px 0 color-mix(in srgb, #fff 16%, transparent)',
    },
  },
};
const skinOf = (name) => SKINS[name] ?? SKINS.default;

/* 首屏转圈用的 keyframes（只注入一次） */
if (typeof document !== 'undefined' && !document.getElementById('dsh-tm-style')) {
  const el = document.createElement('style');
  el.id = 'dsh-tm-style';
  el.textContent = '@keyframes dsh-tm-spin{to{transform:rotate(360deg)}}';
  document.head.appendChild(el);
}
const swatch = (color) => ({
  width: 8, height: 8, borderRadius: 2, background: color, display: 'inline-block', flex: 'none',
});

function Stat({ label, value, unit, color, extra, t, surface }) {
  return React.createElement('div', {
    style: { ...(surface ?? { border: `1px solid ${C.border1}`, borderRadius: 12, background: C.layer1 }), padding: '10px 12px', minWidth: 0 },
  }, [
    React.createElement('div', {
      key: 'k',
      style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.label3, whiteSpace: 'nowrap' },
    }, [color ? React.createElement('span', { key: 's', style: swatch(color) }) : null, label]),
    React.createElement('div', {
      key: 'v',
      style: { fontSize: 19, fontWeight: 700, marginTop: 3, color: C.label, fontVariantNumeric: 'tabular-nums', overflow: 'hidden', textOverflow: 'ellipsis' },
    }, [
      value,
      unit ? React.createElement('span', { key: 'u', style: { fontSize: 12, fontWeight: 600, color: C.label3, marginLeft: 1 } }, unit) : null,
      extra ? React.createElement('span', { key: 'e', style: { fontSize: 12, fontWeight: 500, color: C.label3 } }, extra) : null,
    ]),
  ]);
}

/** 小格子：标签 + 数值（第二栏「均值三连」用） */
function MiniStat({ label, value, hint }) {
  return React.createElement('div', {
    title: hint,
    style: {
      border: `1px solid ${C.border1}`, borderRadius: 9, padding: '7px 9px',
      background: 'var(--dsw-alias-bg-layer-1, rgba(128,128,128,.05))',
    },
  }, [
    React.createElement('div', { key: 't', style: { fontSize: 11, color: C.label3 } }, label),
    React.createElement('div', {
      key: 'v',
      style: { fontSize: 15, fontWeight: 650, fontVariantNumeric: 'tabular-nums', marginTop: 1 },
    }, value),
  ]);
}

/** 图例小圆点 + 文案（构成条用） */
function LegendDot({ color, text }) {
  return React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 4 } }, [
    React.createElement('i', { key: 'i', style: { width: 8, height: 8, borderRadius: 3, background: color, display: 'inline-block' } }),
    React.createElement('span', { key: 't' }, text),
  ]);
}

/** 侧栏入口图标：仪表盘 + 硬币（自绘，不依赖 primitives） */
function MeterIcon({ size = 16, active }) {
  return React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 16 16', fill: 'none',
    stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round',
    style: { opacity: active ? 1 : 0.82 },
  }, [
    React.createElement('path', { key: 'a', d: 'M2.2 12.6a6 6 0 1 1 11.6 0' }),
    React.createElement('path', { key: 'b', d: 'M8 10.4 10.6 6.6' }),
    React.createElement('circle', { key: 'c', cx: '8', cy: '11.2', r: '1.2', fill: 'currentColor', stroke: 'none' }),
  ]);
}

/* ------------------------------------------------------------------ *
 * 数据获取
 * ------------------------------------------------------------------ */
/**
 * 模块级缓存：面板被切走再切回来时，React 组件会重新挂载 —— 有上次结果就直接渲染，
 * 后台再刷新（stale-while-revalidate）。这就是「点击即用」，不再每次都转圈读秒。
 */
let lastSummary = null;

function useSummary(intervalSec) {
  const [state, setState] = React.useState(() => (lastSummary
    ? { status: 'ready', data: lastSummary.data, error: null, at: lastSummary.at }
    : { status: 'loading', data: null, error: null, at: 0 }));
  const [tick, setTick] = React.useState(0);
  const first = React.useRef(true);

  React.useEffect(() => {
    let alive = true;
    // 首次、以及「上一轮只扫了窗口的一部分」时强制重算：宿主那边未变动的文件走增量缓存，
    // 所以每一轮只补扫剩下的部分，几轮内把整个统计窗口补齐；扫完之后回到 5s TTL 缓存。
    const force = first.current || lastSummary?.data?.partialScan === true;
    const url = force ? `${ROUTE}?refresh=1` : ROUTE;
    first.current = false;
    fetch(url, { cache: 'no-store', credentials: 'same-origin' })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const body = await response.json();
        if (!body?.ok) throw new Error(body?.error ?? 'unknown error');
        const at = Date.now();
        lastSummary = { data: body.data, at };
        if (alive) setState({ status: 'ready', data: body.data, error: null, at });
      })
      .catch((error) => {
        // 已有数据时只标记错误，不清空面板
        if (alive) setState((prev) => ({ ...prev, status: prev.data ? 'ready' : 'failed', error: String(error?.message ?? error) }));
      });
    return () => { alive = false; };
  }, [tick]);

  React.useEffect(() => {
    const sec = Number(intervalSec) > 0 ? Number(intervalSec) : 0;
    if (!sec) return undefined;
    const timer = setInterval(() => setTick((n) => n + 1), sec * 1000);
    return () => clearInterval(timer);
  }, [intervalSec]);

  const refresh = React.useCallback(() => setTick((n) => n + 1), []);
  return { ...state, refresh };
}

function useBalance(enabled) {
  const [state, setState] = React.useState({ status: 'idle', data: null });
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    if (!enabled) return undefined;
    let alive = true;
    // 已经拿到过数字就保留旧值刷新，避免每次轮询把余额闪成「查询中」
    setState((prev) => ({ status: prev.data ? 'ready' : 'loading', data: prev.data }));
    const locale = (typeof navigator !== 'undefined' && navigator.language) || 'zh-CN';
    // tick>0 = 用户手动刷新（宿主会跳过 60s 缓存重新取数）
    const url = `${ROUTE_BASE}/balance?locale=${encodeURIComponent(locale)}${tick > 0 ? '&refresh=1' : ''}`;
    fetch(url, { cache: 'no-store', credentials: 'same-origin' })
      .then((r) => r.json())
      .then((body) => { if (alive) setState({ status: 'ready', data: body?.data ?? null }); })
      .catch(() => { if (alive) setState({ status: 'failed', data: null }); });
    return () => { alive = false; };
  }, [enabled, tick]);
  return { ...state, reload: () => setTick((n) => n + 1) };
}

/**
 * 当前会话的实时用量。
 * 面板注册在 root scope，而 useProjection 由 session scope 提供，因此这里要探测：
 * 拿得到就显示「本会话实时」卡片，拿不到（或投影尚未就绪）就整块不渲染。
 * 探测结果在一个组件实例内恒定，hook 调用次数稳定。
 */
function useLiveUsage(props) {
  const useProjection = props?.useProjection;
  if (typeof useProjection !== 'function') return undefined;
  try {
    const value = useProjection('tokenUsage');
    return value && typeof value === 'object' ? value : undefined;
  } catch {
    return undefined;
  }
}

/* ------------------------------------------------------------------ *
 * 面板主体
 * ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ *
 * 新增文案（相对上游新增的视图 / 能力）
 * ------------------------------------------------------------------ */
Object.assign(zh, {
  'tabOverview': '总览',
  'tabDetail': '明细',
  'tabExport': '导出',
  'budgetCard': '预算与余额',
  'projection': '预计今日',
  'projectionHint': '按当前时段匀速外推，仅作参考',
  'monthBudget': '本月预算',
  'monthSpent': '本月已用',
  'monthOff': '未设置本月预算（0 = 关闭）',
  'detailTitle': '明细与排行',
  'detailHint': '按时间窗口查看模型 / 会话 / provider',
  'rangeToday': '今日',
  'range7d': '近 7 天',
  'range30d': '近 30 天',
  'modelBreakdown': '按模型',
  'sessionsBreakdown': '按会话明细',
  'modelsUnit': '个模型',
  'sessionsUnit': '个会话',
  'providerBreakdown': '按 provider（统计窗口）',
  'modelCol': '模型',
  'providerCol': 'provider',
  'tokensCol': 'token',
  'shareCol': '占比',
  'searchSessions': '搜索会话标题 / ID',
  'noMatch': '没有匹配的会话',
  'allShown': '已显示全部',
  'exportTitle': '导出用量数据',
  'exportHint': '从本机聚合结果导出，只含 token 数与金额，不含对话正文、文件路径或凭据。',
  'dataset': '数据',
  'scope': '范围',
  'format': '格式',
  'download': '下载',
  'exporting': '导出中…',
  'exportFailed': '导出失败',
  'exportDone': '已导出',
  'dsDaily': '按天',
  'dsSessions': '按会话',
  'dsModels': '按模型',
  'scopeToday': '今日',
  'scope7d': '近 7 天',
  'scope30d': '近 30 天',
  'scopeAll': '全部',
  'cliTitle': '命令行报表',
  'cliHint': '不启动 DSH 也能看：直接读本机会话日志，零外部依赖。',
  'apiTitle': 'HTTP 接口',
  'apiHint': '与面板同源，需要 DSH 登录态；适合脚本或看板拉数。',
  'copy': '复制',
  'copiedShort': '已复制',
  'noDataWindow': '这个窗口内没有用量',
  'todayVs': '较昨日',
  'estimateNote': '金额为按官方费率的本机估算，不是官方账单',
  'localOnlyNote': '按会话 / 模型明细来自本地日志；按天金额与官方一致时以官方为准',
  'monthProgress': '月度进度',
  'todayCallsLabel': '今日调用',
  'balanceCard': '账户余额',
  'offPeakHint': '空闲档 = 高峰价的一半',
  'detailTotals': '窗口合计',
  'mixedShort': '官方 + 第三方',
  'channelSplit': '渠道拆分',
  'channelCol': '渠道',
  'officialChannel': '官方渠道',
  'thirdChannel': '第三方渠道',
  'channelToday': '今日',
  'channel30d': '近 30 天',
  'channelNote': '官方渠道 = 官方用量 / 官方价；第三方渠道 = 本地日志 + 自定义单价（可配置，未配置时按内置模型价）。',
  'customRateTag': '自定义价',
  'thirdPartyRateNote': 'GLM / Kimi 等第三方模型按明细里的固定单价计费，不适用 DeepSeek 峰谷价；官方峰谷价表只用于 DeepSeek token。',
  'budgetOff': '仅记录花费（未设每日预算）',
  'budgetOffHint': '预算为 0 时不告警、不显示进度条，只记录花费；点这里设置预算',
  'setBudget': '设置预算',
  'windowQuarter': '本季度',
  'windowYear': '本年',
  'wideSourceNote': '本月 / 季度 / 年按本地日志统计；官方用量接口只返回最近 30 天',
  'rangeMonth': '本月',
  'rangeQuarter': '本季度',
  'rangeYear': '本年',
  'scopeMonth': '本月',
  'scopeQuarter': '本季度',
  'scopeYear': '本年',
});

Object.assign(en, {
  'tabOverview': 'Overview',
  'tabDetail': 'Breakdown',
  'tabExport': 'Export',
  'budgetCard': 'Budget & balance',
  'projection': 'Projected today',
  'projectionHint': 'Linear projection from the elapsed day, for reference only',
  'monthBudget': 'Monthly budget',
  'monthSpent': 'This month',
  'monthOff': 'No monthly budget set (0 = off)',
  'detailTitle': 'Breakdown & ranking',
  'detailHint': 'Models / sessions / providers for a time window',
  'rangeToday': 'Today',
  'range7d': 'Last 7d',
  'range30d': 'Last 30d',
  'modelBreakdown': 'By model',
  'sessionsBreakdown': 'Sessions',
  'modelsUnit': 'models',
  'sessionsUnit': 'sessions',
  'providerBreakdown': 'By provider (window)',
  'modelCol': 'Model',
  'providerCol': 'Provider',
  'tokensCol': 'Tokens',
  'shareCol': 'Share',
  'searchSessions': 'Search session title / ID',
  'noMatch': 'No matching sessions',
  'allShown': 'All shown',
  'exportTitle': 'Export usage data',
  'exportHint': 'Exported from the local aggregation. Contains token counts and cost only — no prompts, paths or credentials.',
  'dataset': 'Dataset',
  'scope': 'Scope',
  'format': 'Format',
  'download': 'Download',
  'exporting': 'Exporting…',
  'exportFailed': 'Export failed',
  'exportDone': 'Exported',
  'dsDaily': 'Daily',
  'dsSessions': 'Sessions',
  'dsModels': 'Models',
  'scopeToday': 'Today',
  'scope7d': 'Last 7d',
  'scope30d': 'Last 30d',
  'scopeAll': 'All',
  'cliTitle': 'CLI report',
  'cliHint': 'Works without DSH running: reads local session logs, zero dependencies.',
  'apiTitle': 'HTTP API',
  'apiHint': 'Same origin as the panel and behind DSH auth; suitable for scripts and dashboards.',
  'copy': 'Copy',
  'copiedShort': 'Copied',
  'noDataWindow': 'No usage in this window',
  'todayVs': 'vs yesterday',
  'estimateNote': 'Costs are local estimates using official rates, not an official invoice',
  'localOnlyNote': 'Session/model detail comes from local logs; daily totals prefer official data when available',
  'monthProgress': 'Monthly progress',
  'todayCallsLabel': 'Calls today',
  'balanceCard': 'Balance',
  'offPeakHint': 'Off-peak = half of the peak price',
  'detailTotals': 'Window total',
  'mixedShort': 'official + 3rd-party',
  'channelSplit': 'Channel split',
  'channelCol': 'Channel',
  'officialChannel': 'Official channel',
  'thirdChannel': 'Third-party channel',
  'channelToday': 'Today',
  'channel30d': 'Last 30 days',
  'channelNote': 'Official = official usage / official rates; third-party = local logs with custom rates (built-in model rates when unset).',
  'customRateTag': 'custom rate',
  'thirdPartyRateNote': 'GLM / Kimi and other third-party models use their own flat per-model rates in the breakdown; the peak/off-peak table applies to DeepSeek tokens only.',
  'budgetOff': 'Record only (no daily budget)',
  'budgetOffHint': 'With a budget of 0 the panel records spend without alerts or progress bars; click to set one',
  'setBudget': 'Set budget',
  'windowQuarter': 'This quarter',
  'windowYear': 'This year',
  'wideSourceNote': 'Month / quarter / year use local logs; the official usage API only returns the last 30 days',
  'rangeMonth': 'Month',
  'rangeQuarter': 'Quarter',
  'rangeYear': 'Year',
  'scopeMonth': 'Month',
  'scopeQuarter': 'Quarter',
  'scopeYear': 'Year',
});

/* ------------------------------------------------------------------ *
 * 新面板：三视图（总览 / 明细 / 导出）
 * ------------------------------------------------------------------ */
const h = React.createElement;
const BLANK_DAY = {
  miss: 0, hit: 0, out: 0, calls: 0, cny: 0, hitRate: null,
  byHour: new Array(24).fill(0), peakCalls: 0,
};

/** 北京时间 'YYYY-MM-DD' 日键（浏览器半侧；与宿主 core.mjs 的 dayKeyOf 同口径） */
const dayKeyOf = (ms) => new Date(ms + 8 * 3600e3).toISOString().slice(0, 10);

/** 自然月 / 自然季度 / 自然年的起始日期键（北京时间，'YYYY-MM-DD'） */
function naturalStartKeyOf(kind, todayKey) {
  const year = todayKey.slice(0, 4);
  if (kind === 'year') return `${year}-01-01`;
  const month = Number(todayKey.slice(5, 7));
  if (kind === 'quarter') {
    const firstMonth = Math.floor((month - 1) / 3) * 3 + 1;
    return `${year}-${String(firstMonth).padStart(2, '0')}-01`;
  }
  return `${todayKey.slice(0, 7)}-01`;
}

function Chip({ active, onClick, children, title }) {
  return h('div', {
    title,
    onClick,
    style: {
      fontSize: 11, padding: '3px 9px', borderRadius: 999, cursor: 'pointer', userSelect: 'none',
      border: `1px solid ${active ? 'var(--dsw-alias-brand-primary-foreground, ' + C.brand + ')' : C.border}`,
      background: active ? 'var(--dsw-alias-interactive-bg-hover, rgba(47,125,255,.12))' : 'transparent',
      color: active ? C.label : C.label3,
    },
  }, children);
}

function SectionTitle({ children, right }) {
  return h('div', {
    style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 11.5, color: C.label3 },
  }, [
    h('span', { key: 't', style: { fontSize: 12.5, fontWeight: 650, color: C.label2 } }, children),
    h('span', { key: 'sp', style: { flex: 1 } }),
    right ?? null,
  ]);
}

function Progress({ value, color, height = 8, marker = null }) {
  const width = Math.min(Math.max(Number(value) || 0, 0), 100);
  return h('div', {
    style: { position: 'relative', height, borderRadius: 99, background: 'var(--dsw-alias-border-l1, rgba(128,128,128,.2))' },
  }, [
    h('div', {
      key: 'fill',
      style: { height: '100%', width: `${width.toFixed(1)}%`, borderRadius: 99, background: color, transition: 'width .3s ease' },
    }),
    marker
      ? h('div', {
        key: 'tick',
        title: marker.title,
        style: {
          position: 'absolute', left: `${marker.at}%`, top: -2, width: 2, height: height + 4,
          background: C.warn, opacity: 0.65, borderRadius: 2,
        },
      })
      : null,
  ]);
}

function TokenMeterPanel(props) {
  const { t } = props;
  const [view, setView] = React.useState('overview');
  const [range, setRange] = React.useState(30);
  const [detailRange, setDetailRange] = React.useState('today');
  const [edit, setEdit] = React.useState(null);
  const [intervalSec, setIntervalSec] = React.useState(60);
  const { status, data, error, at, refresh } = useSummary(intervalSec);
  const [selDay, setSelDay] = React.useState(null);
  const [copied, setCopied] = React.useState('');
  const [showAllSessions, setShowAllSessions] = React.useState(false);
  const [sessionQuery, setSessionQuery] = React.useState('');
  const [waitSec, setWaitSec] = React.useState(0);
  const [exportDataset, setExportDataset] = React.useState('daily');
  const [exportScope, setExportScope] = React.useState('7d');
  const [exportFormat, setExportFormat] = React.useState('csv');
  const [exportState, setExportState] = React.useState({ busy: false, error: null, done: null });

  const saveSetting = React.useCallback(async (field, raw) => {
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) {
      setEdit((cur) => (cur ? { ...cur, error: '需要非负数字' } : cur));
      return;
    }
    try {
      const res = await fetch(`${ROUTE_BASE}/settings`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      const out = await res.json();
      if (!out?.ok) throw new Error(out?.error ?? `HTTP ${res.status}`);
      setEdit(null);
      refresh();
    } catch (err) {
      setEdit((cur) => (cur ? { ...cur, error: String(err?.message ?? err) } : cur));
    }
  }, [refresh]);

  // 官方数据是后台补齐的：首屏等它时快速重试几次；首次安装的本地扫描也可能只覆盖了窗口的一部分。
  const officialLoading = data?.official?.reason === 'loading';
  const needsMore = officialLoading || data?.partialScan === true;
  const [officialTries, setOfficialTries] = React.useState(0);
  React.useEffect(() => {
    if (!needsMore) { if (officialTries) setOfficialTries(0); return undefined; }
    if (officialTries >= 40) return undefined;
    const id = setTimeout(() => { setOfficialTries((n) => n + 1); refresh(); }, 1500);
    return () => clearTimeout(id);
  }, [needsMore, officialTries, refresh]);

  React.useEffect(() => {
    const sec = data?.config?.refreshSeconds;
    if (typeof sec === 'number' && sec > 0 && sec !== intervalSec) setIntervalSec(sec);
  }, [data?.config?.refreshSeconds, intervalSec]);

  const live = useLiveUsage(props);
  const balance = useBalance(Boolean(data?.config?.showBalance));

  React.useEffect(() => {
    if (status !== 'loading' || data) return undefined;
    const id = setInterval(() => setWaitSec((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [status, data]);

  const copyText = React.useCallback(async (key, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(''), 1800);
    } catch { /* 剪贴板不可用就算了 */ }
  }, []);

  if (status === 'loading' && !data) {
    return h('div', {
      style: { padding: 28, color: C.label3, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 },
    }, [
      h('span', {
        key: 'sp',
        style: {
          width: 12, height: 12, borderRadius: '50%', display: 'inline-block',
          border: `2px solid ${C.border}`, borderTopColor: C.brand,
          animation: 'dsh-tm-spin .8s linear infinite',
        },
      }),
      h('span', { key: 't' }, `${t('firstLoad')} ${waitSec}s`),
      h('span', { key: 'h', style: { fontSize: 11, color: C.label3 } }, t('firstLoadHint')),
    ]);
  }
  if (status === 'failed' && !data) {
    return h('div', { style: { padding: 28, color: C.error, fontSize: 13 } }, [
      h('div', { key: 'a' }, `${t('failed')}：${error}`),
      h('button', {
        key: 'b',
        onClick: refresh,
        style: {
          marginTop: 10, padding: '5px 12px', borderRadius: 8, cursor: 'pointer',
          border: `1px solid ${C.border}`, background: 'transparent', color: C.label2, fontSize: 12,
        },
      }, t('retry')),
    ]);
  }

  /* ---------------- 基础数据 ---------------- */
  const days = data.days ?? {};
  const today = data.today;
  const S = skinOf(data.config?.skin);
  const glassOn = data.config?.skin === 'glass';
  const D = days[today] ?? BLANK_DAY;
  const dayKeys = Object.keys(days).sort();
  const prevKey = dayKeys.filter((k) => k < today).pop();
  const prev = prevKey ? days[prevKey] : null;
  const hasThirdParty = Object.keys(data.providers ?? {})
    .some((provider) => provider !== 'deepseek-official' && provider !== 'deepseek-account');

  const unit = { hit: 0.02, miss: 1, out: 4 };
  const cfgRates = data.config?.rates;
  if (cfgRates?.offPeak?.['deepseek-flash']) {
    const r = data.peakNow ? cfgRates.peak : cfgRates.offPeak;
    const f = r?.['deepseek-flash'];
    if (f) { unit.hit = f.cacheHit; unit.miss = f.cacheMiss; unit.out = f.output; }
  }
  const RATE_KEY = { hit: 'cacheHit', miss: 'cacheMiss', out: 'output' };
  const rateOf = (set, which) => set?.[RATE_KEY[which]] ?? set?.[which] ?? unit[which];
  const SD = selDay && days[selDay] ? days[selDay] : D;
  const cHit = (D.hit / 1e6) * unit.hit;
  const cMiss = (D.miss / 1e6) * unit.miss;
  const cOut = (D.out / 1e6) * unit.out;
  const actual = cHit + cMiss + cOut || D.cny || 0;
  const costOf = (which) => {
    if (!SD.tier) return ((SD[which] ?? 0) / 1e6) * unit[which];
    const atTier = (tier) => (((SD.tier[tier] ?? {})[which] ?? 0) / 1e6) * rateOf(cfgRates?.[tier]?.['deepseek-flash'], which);
    return atTier('peak') + atTier('offPeak');
  };
  // 成本构成优先用宿主聚合出的「按 token 类型实际成本」（跨 provider 精确，GLM / Kimi 固定价也正确）；
  // 老数据没有 costByType 时退回按 DeepSeek 峰谷价推算。
  const typedCost = SD.costByType && (SD.costByType.hit + SD.costByType.miss + SD.costByType.out) > 0
    ? SD.costByType : null;
  const sHit = typedCost ? typedCost.hit : costOf('hit');
  const sMiss = typedCost ? typedCost.miss : costOf('miss');
  const sOut = typedCost ? typedCost.out : costOf('out');
  const tokOf = (which) => (SD.tier
    ? ((SD.tier.peak?.[which] ?? 0) + (SD.tier.offPeak?.[which] ?? 0))
    : (SD[which] ?? 0));
  const splitDay = selDay && days[selDay] ? selDay : today;
  const splitTotal = (sHit + sMiss + sOut) > 0 ? (sHit + sMiss + sOut) : ((SD.cny ?? 0) || 1);

  /* ---------------- 金额窗口 ---------------- */
  // 宿主返回的 days 已合并官方 DeepSeek 用量与本地第三方用量，窗口直接用它
  const daySrc = days;
  const cnyOfKey = (map, key) => {
    const v = map?.[key];
    if (v === null || v === undefined) return 0;
    return Number(typeof v === 'object' ? (v.cny ?? 0) : v) || 0;
  };
  const keysBack = (n) => Array.from({ length: n }, (_, i) => new Date(Date.now() - i * 86400000 + 8 * 3600e3).toISOString().slice(0, 10));
  const sumKeys = (keys) => keys.reduce((acc, key) => acc + cnyOfKey(daySrc, key), 0);
  const last30 = keysBack(30);
  // 自然月 / 季度 / 年：宿主已把官方 30 天与本地第三方/更早历史合并进 days
  const wideDays = days;
  const localKeys = Object.keys(wideDays).filter((key) => key <= today).sort();
  const sumLocalFrom = (startKey) => localKeys.reduce((acc, key) => (key >= startKey ? acc + cnyOfKey(wideDays, key) : acc), 0);
  const monthStart = naturalStartKeyOf('month', today);
  const quarterStart = naturalStartKeyOf('quarter', today);
  const yearStart = naturalStartKeyOf('year', today);
  const monthSpent = sumLocalFrom(monthStart);
  const quarterSpent = sumLocalFrom(quarterStart);
  const yearSpent = sumLocalFrom(yearStart);
  const windows = [
    { key: 'd7', label: t('window7'), value: sumKeys(last30.slice(0, 7)) },
    { key: 'd30', label: t('window30'), value: sumKeys(last30) },
    { key: 'month', label: t('windowMonth'), value: monthSpent, local: true },
    { key: 'quarter', label: t('windowQuarter'), value: quarterSpent, local: true },
    { key: 'year', label: t('windowYear'), value: yearSpent, local: true },
  ];

  /* ---------------- 预算 / 余额 / 口径 ---------------- */
  const budget = Number(data.config?.dailyBudget) || 0;
  const usedPct = budget > 0 ? pct(D.cny, budget) : 0;
  const alertPct = Number(data.config?.alertAtPercent) || 80;
  const over = budget > 0 && D.cny > budget;
  const warn = budget > 0 && !over && usedPct >= alertPct;
  const bjNow = new Date(Date.now() + 8 * 3600e3);
  const elapsedFrac = (bjNow.getUTCHours() * 60 + bjNow.getUTCMinutes()) / 1440;
  const projection = D.calls > 0 && elapsedFrac > 0.03 ? D.cny / elapsedFrac : null;
  const monthBudget = Number(data.config?.monthlyBudget) || 0;
  const monthPct = monthBudget > 0 ? pct(monthSpent, monthBudget) : 0;

  const balData = balance.data;
  const balInfo = balData?.ok ? balData.balance_infos?.[0] : null;
  const balCur = balInfo?.currency === 'USD' ? '$' : '¥';
  const balGranted = balInfo && Number(balInfo.granted_balance) > 0 ? String(balInfo.granted_balance) : null;
  const lowAlert = Number(data.config?.lowBalanceAlert) || 0;
  const balLow = Boolean(balInfo) && lowAlert > 0 && Number(balInfo.total_balance ?? 0) < lowAlert;
  const balCostRow = (() => {
    const rows = balData?.total_costs;
    if (!Array.isArray(rows) || !rows.length) return null;
    return rows.find((row) => row?.currency === balInfo?.currency) ?? rows[0];
  })();
  const balCost = balCostRow && Number(balCostRow.amount) > 0 ? balCostRow.amount : null;
  const balSource = balData?.source === 'account' ? t('balanceAccount')
    : balData?.source === 'apikey' ? t('balanceApiKey') : '';
  const balText = !data.config?.showBalance
    ? t('notEnabled')
    : balInfo ? `${balCur}${balInfo.total_balance}`
      : balance.status === 'loading' ? t('balanceLoading')
        : (balData?.reason === 'disabled' ? t('notEnabled') : (balData?.error ?? t('balanceFailed')));

  const official = data.official;
  const officialOk = Boolean(official?.ok);
  const meterOfficial = data.meterSource === 'official';
  const meterMixed = data.meterSource === 'mixed';
  const shown = D.cny;
  const officialBase = meterOfficial && Number(official?.yesterdayCny) > 0 ? Number(official.yesterdayCny) : null;
  const localBase = prev && prev.cny > 0 ? prev.cny : null;
  const base = meterOfficial ? officialBase : localBase;
  const shownDelta = base ? ((shown - base) / base) * 100 : null;
  const deltaLabel = meterOfficial ? t('yesterdayLabel') : (prevKey ? prevKey.slice(5) : '');

  /* ---------------- 趋势 / 分时 ---------------- */
  const window_ = [];
  for (let i = range - 1; i >= 0; i--) {
    const ts = Date.now() - i * 86400000;
    const key = new Date(ts + 8 * 3600e3).toISOString().slice(0, 10);
    window_.push({ key, entry: days[key] ?? null });
  }
  const maxTotal = Math.max(...window_.map(({ entry }) => (entry ? entry.hit + entry.miss + entry.out : 0)), 1);
  const dataDays = window_.filter(({ entry }) => entry && entry.hit + entry.miss + entry.out > 0).length;
  const firstDataIdx = window_.findIndex(({ entry }) => entry && entry.hit + entry.miss + entry.out > 0);
  const trend_ = dataDays > 0 && dataDays < 3 && firstDataIdx > 0 ? window_.slice(firstDataIdx) : window_;
  const maxHour = Math.max(...(D.byHour ?? [0]), 1);
  const peakHour = (D.byHour ?? []).indexOf(maxHour);
  const peakHoursToday = (() => {
    const bj = new Date(Date.now() + 8 * 3600e3);
    const dow = bj.getUTCDay();
    const weekend = dow === 0 || dow === 6;
    return Array.from({ length: 24 }, (_, hour) => !weekend && ((hour >= 9 && hour < 12) || (hour >= 14 && hour < 18)));
  })();

  /* ---------------- 明细窗口 ---------------- */
  const cutoffDay = detailRange === 'today' ? today
    : detailRange === '7d' ? dayKeyOf(Date.now() - 6 * 86400000)
      : detailRange === '30d' ? dayKeyOf(Date.now() - 29 * 86400000)
        : naturalStartKeyOf(detailRange, today);
  const cutoffMs = Date.parse(`${cutoffDay}T00:00:00+08:00`);
  // 宽窗口（月 / 季度 / 年）用本地完整历史，避免官方 30 天窗口把合计算少
  const detailSource = days;
  const detailTotals = (() => {
    const acc = { cny: 0, calls: 0, hit: 0, miss: 0, out: 0 };
    for (const [key, value] of Object.entries(detailSource)) {
      if (key < cutoffDay) continue;
      acc.cny += Number(value.cny ?? 0);
      acc.calls += Number(value.calls ?? 0);
      acc.hit += Number(value.hit ?? 0);
      acc.miss += Number(value.miss ?? 0);
      acc.out += Number(value.out ?? 0);
    }
    return acc;
  })();

  const modelRows = (() => {
    const buckets = new Map();
    const dayModels = data.dayModels ?? {};
    if (Object.keys(dayModels).length) {
      for (const [key, bucket] of Object.entries(dayModels)) {
        const bar = key.indexOf('|');
        if (bar < 0) continue;
        const day = key.slice(0, bar);
        if (day < cutoffDay) continue;
        const modelKey = key.slice(bar + 1);
        const acc = buckets.get(modelKey) ?? { calls: 0, hit: 0, miss: 0, out: 0, cny: 0 };
        acc.calls += bucket.calls ?? 0;
        acc.hit += bucket.hit ?? 0;
        acc.miss += bucket.miss ?? 0;
        acc.out += bucket.out ?? 0;
        acc.cny += bucket.cny ?? 0;
        buckets.set(modelKey, acc);
      }
    } else {
      for (const [key, bucket] of Object.entries(data.models ?? {})) {
        buckets.set(key, {
          calls: bucket.calls ?? 0, hit: bucket.hit ?? 0, miss: bucket.miss ?? 0,
          out: bucket.out ?? 0, cny: bucket.cny ?? 0,
        });
      }
    }
    return [...buckets.entries()]
      .map(([key, b]) => ({ key, ...b }))
      .filter((row) => row.calls > 0)
      .sort((a, b) => b.cny - a.cny);
  })();
  const modelTotalCny = modelRows.reduce((acc, row) => acc + row.cny, 0) || 1;

  const sessionRows = Object.values(data.sessions ?? {})
    .filter((s) => (s.calls ?? 0) > 0 && (s.lastTime ?? 0) >= cutoffMs)
    .sort((a, b) => (b.cny ?? 0) - (a.cny ?? 0));
  const sessionQueryNorm = sessionQuery.trim().toLowerCase();
  const filteredSessions = sessionQueryNorm
    ? sessionRows.filter((s) => `${s.title ?? ''} ${s.id}`.toLowerCase().includes(sessionQueryNorm))
    : sessionRows;
  const maxSessionCny = filteredSessions.length ? Math.max(...filteredSessions.map((s) => s.cny)) : 1;

  // 渠道拆分：官方渠道合并成一行，第三方按 provider 分行；窗口用今日 / 近 30 天
  const officialProviderSet = new Set(data.officialProviders ?? ['deepseek-official', 'deepseek-account']);
  const channelStats = (() => {
    const cutoff30 = dayKeyOf(Date.now() - 29 * 86400000);
    const todayKey = data.today;
    const rows = new Map();
    const touch = (rowKey, isOfficial) => {
      if (!rows.has(rowKey)) rows.set(rowKey, { key: rowKey, official: isOfficial, provider: isOfficial ? '' : rowKey, today: { cny: 0, tokens: 0 }, d30: { cny: 0, tokens: 0 } });
      return rows.get(rowKey);
    };
    // dayModels 的键是 `${day}|${provider} | ${model}`，取出 provider 并按天归集
    for (const [key, bucket] of Object.entries(data.dayModels ?? {})) {
      const bar = key.indexOf('|');
      if (bar < 0) continue;
      const day = key.slice(0, bar);
      if (day < cutoff30) continue;
      const rest = key.slice(bar + 1);
      const sep = rest.indexOf(' | ');
      const provider = sep >= 0 ? rest.slice(0, sep) : rest;
      const isOfficial = officialProviderSet.has(provider);
      const row = touch(isOfficial ? '__official' : provider, isOfficial);
      const cny = Number(bucket.cny ?? 0);
      const tokens = (bucket.hit ?? 0) + (bucket.miss ?? 0) + (bucket.out ?? 0);
      row.d30.cny += cny;
      row.d30.tokens += tokens;
      if (day === todayKey) {
        row.today.cny += cny;
        row.today.tokens += tokens;
      }
    }
    if (!rows.size) {
      // 老数据没有 dayModels：用 days / daysThirdParty 兜底，拆官方 / 第三方两行
      const tp = data.daysThirdParty ?? {};
      const pick = (filter) => Object.entries(days)
        .filter(([day]) => filter(day))
        .reduce((acc, [day]) => ({
          cny: acc.cny + Number(days[day].cny ?? 0) - Number(tp[day]?.cny ?? 0),
          tpCny: acc.tpCny + Number(tp[day]?.cny ?? 0),
          tokens: acc.tokens + (days[day].hit ?? 0) + (days[day].miss ?? 0) + (days[day].out ?? 0),
          tpTokens: acc.tpTokens + (tp[day]?.hit ?? 0) + (tp[day]?.miss ?? 0) + (tp[day]?.out ?? 0),
        }), { cny: 0, tpCny: 0, tokens: 0, tpTokens: 0 });
      const todaySum = pick((day) => day === todayKey);
      const monthSum = pick((day) => day >= cutoff30);
      rows.set('__official', { key: '__official', official: true, provider: '', today: { cny: todaySum.cny, tokens: todaySum.tokens }, d30: { cny: monthSum.cny, tokens: monthSum.tokens } });
      if (monthSum.tpCny > 0 || todaySum.tpCny > 0) {
        rows.set('__third', { key: '__third', official: false, provider: '', today: { cny: todaySum.tpCny, tokens: todaySum.tpTokens }, d30: { cny: monthSum.tpCny, tokens: monthSum.tpTokens } });
      }
    }
    return [...rows.values()].sort((a, b) => (b.official ? 1 : 0) - (a.official ? 1 : 0) || b.d30.cny - a.d30.cny);
  })();
  const channelRateKeys = data.config?.channelRates && typeof data.config.channelRates === 'object'
    ? Object.keys(data.config.channelRates) : [];

  /** 明细的 provider 卡片跟着明细窗口走；没有 dayModels 的旧数据退回全历史 */
  const providerRows = (() => {
    const src = data.dayModels ?? {};
    if (Object.keys(src).length) {
      const acc = new Map();
      for (const [key, bucket] of Object.entries(src)) {
        const bar = key.indexOf('|');
        if (bar < 0) continue;
        if (key.slice(0, bar) < cutoffDay) continue;
        const rest = key.slice(bar + 1);
        const sep = rest.indexOf(' | ');
        const provider = sep >= 0 ? rest.slice(0, sep) : rest;
        const cur = acc.get(provider) ?? { calls: 0, tokens: 0, cny: 0 };
        cur.calls += bucket.calls ?? 0;
        cur.tokens += (bucket.hit ?? 0) + (bucket.miss ?? 0) + (bucket.out ?? 0);
        cur.cny += Number(bucket.cny ?? 0);
        acc.set(provider, cur);
      }
      return [...acc.entries()].sort((a, b) => b[1].cny - a[1].cny);
    }
    return Object.entries(data.providers ?? {}).sort(([, a], [, b]) => (b.cny ?? 0) - (a.cny ?? 0));
  })();

  const plugin = data.plugin ?? {};
  const update = plugin.update;

  /* ---------------- 导出 ---------------- */
  const doExport = async () => {
    setExportState({ busy: true, error: null, done: null });
    try {
      const url = `${ROUTE_BASE}/export?dataset=${exportDataset}&scope=${exportScope}&format=${exportFormat}`;
      const res = await fetch(url, { cache: 'no-store', credentials: 'same-origin' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const disposition = res.headers.get('content-disposition') ?? '';
      const name = /filename="([^"]+)"/.exec(disposition)?.[1]
        ?? `dsh-token-cost-${exportDataset}-${exportScope}.${exportFormat}`;
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = href;
      anchor.download = name;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(href), 2000);
      setExportState({ busy: false, error: null, done: name });
    } catch (err) {
      setExportState({ busy: false, error: String(err?.message ?? err), done: null });
    }
  };

  /* ---------------- 样式 ---------------- */
  const rightAlign = { textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' };
  const cell = (extra = {}) => ({ padding: '6px 8px', borderBottom: `1px solid ${C.border1}`, ...extra });
  const tableHead = (labels, aligns = []) => h('thead', { key: 'th' }, h('tr', null, labels.map((label, index) => h('th', {
    key: label + index,
    style: {
      textAlign: aligns[index] ?? (index === 0 ? 'left' : 'right'),
      fontWeight: 600, fontSize: 11, color: C.label3, padding: '6px 8px',
      borderBottom: `1px solid ${C.border1}`, whiteSpace: 'nowrap',
    },
  }, label))));
  const tabButton = (key, label) => h('div', {
    key,
    onClick: () => setView(key),
    style: {
      padding: '6px 14px', borderRadius: 999, cursor: 'pointer', userSelect: 'none',
      fontSize: 12.5, fontWeight: view === key ? 700 : 500,
      color: view === key ? C.label : C.label3,
      background: view === key ? 'var(--dsw-alias-interactive-bg-hover, rgba(47,125,255,.12))' : 'transparent',
      border: `1px solid ${view === key ? C.brand : 'transparent'}`,
    },
  }, label);
  const dataSourceBadge = h('span', {
    key: 'src',
    style: {
      fontSize: 10.5, fontWeight: 600, padding: '2px 7px', borderRadius: 999,
      border: `1px solid ${C.border}`, color: officialOk ? C.brand : C.label3, verticalAlign: 'middle',
    },
  }, meterOfficial ? t('officialLabel') : meterMixed ? t('mixedShort') : t('localShort'));

  /* ---------------- 概览 ---------------- */
  const overview = h('div', { key: 'overview' }, [
    // 第一行：今日消费 + 预算 / 余额
    h('div', {
      key: 'hero',
      style: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 },
    }, [
      h('div', { key: 'spend', style: { ...S.panel, display: 'flex', flexDirection: 'column', gap: 8 } }, [
        h('div', { key: 'l', style: { fontSize: 12, color: C.label2 } }, `${t('today')} · ${today}`),
        h('div', {
          key: 'n',
          style: { fontSize: 34, fontWeight: 750, lineHeight: 1.15, fontVariantNumeric: 'tabular-nums', display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' },
        }, [
          h('span', { key: 'c', style: { fontSize: 16, fontWeight: 600, color: C.label2 } }, '¥'),
          shown.toFixed(2),
          dataSourceBadge,
          shownDelta !== null ? h('span', {
            key: 'd',
            style: {
              fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 999,
              color: shownDelta >= 0 ? C.error : C.ok,
              background: 'var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,.12))',
            },
          }, `${t('vsPrevOn')} ${deltaLabel} ${shownDelta >= 0 ? '+' : '−'}${Math.abs(shownDelta).toFixed(0)}%`) : null,
        ]),
        h('div', {
          key: 'meta',
          style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 11, color: C.label3, fontVariantNumeric: 'tabular-nums' },
        }, [
          h('span', { key: 'mt' }, `${t('updated')} ${clock(at || data.generatedAt)}`),
          h('div', {
            key: 'rf',
            onClick: refresh,
            title: t('refresh'),
            style: {
              display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600,
              padding: '2px 9px', borderRadius: 999, cursor: 'pointer', userSelect: 'none',
              border: `1px solid ${C.brand}`, color: C.brand,
              background: 'var(--dsw-alias-interactive-bg-hover, rgba(47,125,255,.10))',
              opacity: status === 'loading' ? 0.55 : 1,
            },
          }, [h('span', { key: 'i', style: { fontSize: 12, lineHeight: 1 } }, '⟳'), t('refresh')]),
        ]),
        h('div', {
          key: 'money',
          style: { marginTop: 4, paddingTop: 8, borderTop: `1px solid ${C.border1}`, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '7px 12px' },
        }, [
          ...windows.map((m) => h('div', { key: m.key, style: { minWidth: 0 } }, [
            h('div', { key: 'l', style: { fontSize: 10.5, color: C.label3, whiteSpace: 'nowrap' } }, m.label),
            h('div', {
              key: 'v',
              style: { fontSize: 15, fontWeight: 650, color: C.label2, fontVariantNumeric: 'tabular-nums' },
            }, `¥${fmtMoney(m.value)}`),
          ])),
          h('div', {
            key: 'wnote',
            style: { gridColumn: '1 / -1', fontSize: 10, color: C.label3, lineHeight: 1.6 },
          }, t('wideSourceNote')),
        ]),
        balCost ? h('div', {
          key: 'total',
          style: { fontSize: 11, color: C.label3, fontVariantNumeric: 'tabular-nums' },
        }, `${t('totalSpent')} ¥${fmtMoney(balCost)}`) : null,
      ]),

      h('div', { key: 'budget', style: { ...S.panel, fontSize: 11.5, color: C.label2, display: 'flex', flexDirection: 'column', gap: 8 } }, [
        h('div', { key: 'h', style: { fontSize: 12, fontWeight: 650, color: C.label2 } }, t('budgetCard')),
        h('div', { key: 'b1' }, [
          h('div', { key: 'l', style: { display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 11, marginBottom: 5 } }, [
            budget > 0 ? h('span', {
              key: 'n', title: t('editBudgetHint'),
              onClick: () => setEdit({ field: 'dailyBudget', label: t('budgetUsed'), value: String(budget) }),
              style: { color: C.label3, cursor: 'pointer', textDecoration: 'underline dotted' },
            }, `${t('budgetUsed')} ${money(budget)} ✎`)
              : h('span', {
                key: 'n', title: t('budgetOffHint'),
                onClick: () => setEdit({ field: 'dailyBudget', label: t('budgetUsed'), value: String(budget) }),
                style: { color: C.label2, cursor: 'pointer', textDecoration: 'underline dotted' },
              }, `${t('budgetOff')} ✎`),
            h('span', {
              key: 'v',
              style: {
                marginLeft: 'auto', color: over ? C.error : C.label2, fontWeight: 600,
                fontVariantNumeric: 'tabular-nums', textAlign: 'right',
              },
            }, budget > 0
              ? `${t('used')} ${usedPct.toFixed(1)}% · ${t('remain')} ${money(Math.max(0, budget - D.cny))}${over ? ` · ⚠ ${t('overBudget')}` : warn ? ` · ⚠ ${t('warnLine')} ${alertPct}%` : ''}`
              : `今日 ${money(D.cny)}`),
          ]),
          budget > 0 ? h(Progress, {
            key: 'p', value: usedPct, color: over ? C.error : warn ? C.warn : C.brand,
            marker: alertPct > 0 && alertPct < 100 ? { at: alertPct, title: `${t('warnLine')} ${alertPct}%` } : null,
          }) : h('div', {
            key: 'p',
            title: t('budgetOffHint'),
            onClick: () => setEdit({ field: 'dailyBudget', label: t('budgetUsed'), value: '50' }),
            style: { fontSize: 10.5, color: C.label3, cursor: 'pointer', lineHeight: 1.6 },
          }, t('budgetOffHint')),
          h('div', {
            key: 'proj',
            style: { display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6, fontSize: 11, color: C.label3 },
          }, [
            h('span', { key: 'l' }, `${t('projection')} `),
            h('span', {
              key: 'v',
              style: { fontWeight: 650, color: projection !== null && budget > 0 && projection > budget ? C.error : C.label2, fontVariantNumeric: 'tabular-nums' },
            }, projection === null ? '—' : money(projection)),
            h('span', { key: 'h', title: t('projectionHint'), style: { fontSize: 10.5 } }, 'ⓘ'),
          ]),
        ]),
        h('div', { key: 'b2', style: { borderTop: `1px solid ${C.border1}`, paddingTop: 7 } }, [
          h('div', { key: 'l', style: { display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 11, marginBottom: 5 } }, [
            h('span', {
              key: 'n', title: t('budgetOffHint'),
              onClick: () => setEdit({ field: 'monthlyBudget', label: t('monthBudget'), value: String(monthBudget) }),
              style: { color: C.label3, cursor: 'pointer', textDecoration: 'underline dotted' },
            }, `${t('monthBudget')} ✎`),
            h('span', { key: 'v', style: { marginLeft: 'auto', color: C.label2, fontWeight: 600, fontVariantNumeric: 'tabular-nums' } },
              monthBudget > 0 ? `¥${fmtMoney(monthSpent)} / ¥${fmtMoney(monthBudget)}` : `${t('monthSpent')} ¥${fmtMoney(monthSpent)} · ${t('monthOff')}`),
          ]),
          monthBudget > 0 ? h(Progress, {
            key: 'p', value: monthPct, color: monthPct >= 100 ? C.error : monthPct >= 80 ? C.warn : C.brand,
          }) : null,
        ]),
        h('div', { key: 'bal', style: { borderTop: `1px solid ${C.border1}`, paddingTop: 7, cursor: 'pointer' }, onClick: () => { balance.reload(); refresh(); } }, [
          h('div', { key: 'l', style: { display: 'flex', alignItems: 'baseline', gap: 6, fontSize: 11, color: C.label3 } }, [
            h('span', { key: 'n' }, t('balance')),
            h('span', { key: 'r', style: { marginLeft: 'auto', fontSize: 12 } }, '⟳'),
          ]),
          h('div', { key: 'v', style: { display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 1 } }, [
            balInfo ? h('span', {
              key: 'n',
              style: {
                fontSize: 23, fontWeight: 750, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em',
                color: balLow ? C.error : undefined, opacity: balLow ? 0.88 : undefined,
              },
            }, [h('span', { key: 'c', style: { fontSize: 13, fontWeight: 600, color: C.label2, marginRight: 1 } }, balCur), fmtMoney(balInfo.total_balance)])
              : h('span', {
                key: 'e',
                style: { fontSize: 12.5, fontWeight: 600, color: balData && balData.ok === false ? C.warn : C.label3 },
              }, balText),
            balGranted ? h('span', { key: 'g', style: { fontSize: 10.5, color: C.label3 } }, `${t('inclGranted')} ${balCur}${fmtMoney(balGranted)}`) : null,
            balSource ? h('span', {
              key: 's', style: { fontSize: 10, color: C.label3, padding: '1px 6px', borderRadius: 999, border: `1px solid ${C.border}` },
            }, balSource) : null,
          ]),
        ]),
        balLow ? h('div', {
          key: 'lowbal',
          onClick: () => setEdit({ field: 'lowBalanceAlert', label: t('lowBalance'), value: String(lowAlert) }),
          title: t('lowBalanceHint'),
          style: { fontSize: 11, cursor: 'pointer', color: C.error, opacity: 0.9 },
        }, `⚠ ${t('lowBalance')} ¥${fmtMoney(lowAlert)} · ${t('editLowHint')} ✎`) : null,
        edit ? h('div', {
          key: 'edit',
          style: { display: 'flex', alignItems: 'center', gap: 6, paddingTop: 6, borderTop: `1px solid ${C.border1}`, fontSize: 11.5 },
        }, [
          h('span', { key: 'l', style: { color: C.label3 } }, `${edit.label} =`),
          h('input', {
            key: 'i', value: edit.value, autoFocus: true, inputMode: 'decimal',
            onChange: (e) => setEdit((cur) => ({ ...cur, value: e.target.value, error: null })),
            onKeyDown: (e) => {
              if (e.key === 'Enter') saveSetting(edit.field, edit.value);
              if (e.key === 'Escape') setEdit(null);
            },
            style: {
              width: 76, padding: '2px 6px', fontSize: 12, fontVariantNumeric: 'tabular-nums',
              borderRadius: 6, border: `1px solid ${C.border}`, background: 'transparent', color: C.label,
            },
          }),
          h('span', { key: 's', onClick: () => saveSetting(edit.field, edit.value), style: { cursor: 'pointer', color: C.brand, fontWeight: 650 } }, t('save')),
          h('span', { key: 'c', onClick: () => setEdit(null), style: { cursor: 'pointer', color: C.label3 } }, t('cancel')),
          edit.error ? h('span', { key: 'e', style: { color: C.error } }, edit.error) : null,
        ]) : null,
        h('div', { key: 'src', style: { fontSize: 10.5, color: C.label3, lineHeight: 1.7, borderTop: `1px solid ${C.border1}`, paddingTop: 6 } }, [
          h('div', { key: 'rate' }, `${t('rateLine')}：${data.peakNow ? t('peak') : t('offpeak')}`),
          officialOk ? h('div', { key: 'ok', style: { color: C.label3 } }, `${t('officialLabel')} ✓ ${official.days ? Object.keys(official.days).length : 0} 天`)
            : h('div', { key: 'off' }, `${t('officialLabel')}：${official?.reason === 'loading' ? t('officialLoading') : official?.reason === 'disabled' ? t('officialOff') : official?.reason === 'no-credential' ? t('notConnectedChrome') : official?.reason === 'no-browser' ? t('noBrowser') : (official?.error ?? t('balanceFailed'))}`),
          h('div', { key: 'link' }, h('a', {
            href: data.billingUrl || 'https://platform.deepseek.com/usage', target: '_blank', rel: 'noreferrer',
            style: { color: C.brand, textDecoration: 'none' },
          }, `${t('billingLink')} ↗`)),
        ]),
      ]),
    ]),

    // 第二行：token 统计 + 峰谷价
    h('div', {
      key: 'statsRow',
      style: { display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 12, marginTop: 12 },
    }, [
      h('div', { key: 'stats', style: { ...S.panel, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignContent: 'start' } }, [
        h(Stat, { key: '1', t, surface: S.stat, label: t('hitInput'), color: C.hit, value: fmt(D.hit) }),
        h(Stat, { key: '2', t, surface: S.stat, label: t('hitRate'), value: D.hitRate === null || D.hitRate === undefined ? '—' : `${D.hitRate}`, unit: '%' }),
        h(Stat, { key: '3', t, surface: S.stat, label: t('missInput'), color: C.miss, value: fmt(D.miss) }),
        h(Stat, { key: '4', t, surface: S.stat, label: t('output'), color: C.out, value: fmt(D.out) }),
        h('div', {
          key: 'avg',
          style: { gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, borderTop: `1px solid ${C.border1}`, paddingTop: 8, marginTop: 2 },
        }, [
          h(MiniStat, { key: 'tt', label: t('totalTokens'), value: fmt(D.hit + D.miss + D.out) }),
          h(MiniStat, { key: 'c', label: t('callsShort'), value: `${D.calls}` }),
          h(MiniStat, { key: 'pc', label: t('perCall'), hint: t('perCallHint'), value: D.calls > 0 ? `¥${(D.cny / D.calls).toFixed(4)}` : '—' }),
        ]),
        h('div', { key: 'compose', style: { gridColumn: '1 / -1', borderTop: `1px solid ${C.border1}`, paddingTop: 8, marginTop: 2, fontSize: 11 } }, (() => {
          const total = D.hit + D.miss + D.out;
          const seg = (n, color) => (total > 0 ? h('i', { key: color, style: { flexGrow: Math.max(n, total / 2000), background: color } }) : null);
          return [
            h('div', { key: 'h', style: { display: 'flex', alignItems: 'baseline', gap: 8 } }, [
              h('span', { key: 'l', style: { color: C.label3 } }, t('composeTitle')),
              h('span', { key: 'v', style: { marginLeft: 'auto', color: C.label2, fontWeight: 600, fontVariantNumeric: 'tabular-nums' } }, fmt(total)),
            ]),
            h('div', { key: 'bar', style: { display: 'flex', height: 9, borderRadius: 99, overflow: 'hidden', marginTop: 7, background: C.border1 } }, [seg(D.hit, C.hit), seg(D.miss, C.miss), seg(D.out, C.out)]),
            h('div', { key: 'lg', style: { display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 10.5, color: C.label3, marginTop: 5 } }, [
              h(LegendDot, { key: 'h', color: C.hit, text: `${t('hitInput')} ${fmt(D.hit)}${total > 0 ? ` · ${((100 * D.hit) / total).toFixed(1)}%` : ''}` }),
              h(LegendDot, { key: 'm', color: C.miss, text: `${t('missInput')} ${fmt(D.miss)}${total > 0 ? ` · ${((100 * D.miss) / total).toFixed(1)}%` : ''}` }),
              h(LegendDot, { key: 'o', color: C.out, text: `${t('output')} ${fmt(D.out)}${total > 0 ? ` · ${((100 * D.out) / total).toFixed(1)}%` : ''}` }),
            ]),
          ];
        })()),
      ]),

      h('div', { key: 'rates', style: { ...S.panel, fontSize: 11, color: C.label3, lineHeight: 1.7 } }, [
        h('div', { key: 'h', style: { fontSize: 12, fontWeight: 650, color: C.label2 } }, t('tierTitle')),
        h('div', { key: 'tier', style: { marginTop: 4 } }, [
          h('span', { key: 'l', style: { color: C.label2, fontWeight: 600 } }, `${t('currentTier')}：`),
          h('span', { key: 'v', style: { color: data.peakNow ? C.warn : C.label2 } }, data.peakNow ? t('peak') : t('offpeak')),
        ]),
        h('div', { key: 'w', style: { fontSize: 10.5, lineHeight: 1.6 } }, t('peakWindow')),
        (() => {
          const rows = [
            { k: 'hit', label: t('hitInput'), now: unit.hit, tokens: D.hit },
            { k: 'miss', label: t('missInput'), now: unit.miss, tokens: D.miss },
            { k: 'out', label: t('output'), now: unit.out, tokens: D.out },
          ];
          const line = { borderTop: `1px solid ${C.border1}` };
          const td = (key, value, style) => h('td', { key, style }, value);
          return h('table', { key: 'merge', style: { width: '100%', borderCollapse: 'collapse', fontSize: 11, marginTop: 9 } }, [
            h('thead', { key: 'th' }, h('tr', null, [
              h('th', { key: 'i', style: { textAlign: 'left', fontSize: 10.5, fontWeight: 600, color: C.label3, padding: '2px 4px' } }, t('colItem')),
              h('th', { key: 'p', style: { textAlign: 'right', fontSize: 10.5, fontWeight: 600, color: C.label3, padding: '2px 4px' } }, t('colPrice')),
              h('th', { key: 'u', style: { textAlign: 'right', fontSize: 10.5, fontWeight: 600, color: C.label3, padding: '2px 4px' } }, t('colUsage')),
              h('th', { key: 's', style: { textAlign: 'right', fontSize: 10.5, fontWeight: 600, color: C.label3, padding: '2px 4px' } }, t('colSubtotal')),
            ])),
            h('tbody', { key: 'tb' }, [
              ...rows.map((r) => h('tr', { key: r.k }, [
                td('i', r.label, { ...line, padding: '3px 4px', color: C.label2, whiteSpace: 'nowrap' }),
                td('p', h('b', { style: { color: C.ok } }, `¥${r.now}`), { ...line, ...rightAlign, padding: '3px 4px' }),
                td('u', fmtM(r.tokens), { ...line, ...rightAlign, padding: '3px 4px' }),
                td('s', money((r.tokens / 1e6) * (r.now ?? 0)), { ...line, ...rightAlign, padding: '3px 4px', fontWeight: 650 }),
              ])),
              h('tr', { key: 'all' }, [
                td('l', t('todayTotal'), { ...line, padding: '3px 4px', textAlign: 'right', color: C.label2, fontWeight: 700, colSpan: 3, whiteSpace: 'nowrap' }),
                td('v', money(D.cny), { ...line, ...rightAlign, padding: '3px 4px', fontWeight: 750, color: C.label }),
              ]),
            ]),
          ]);
        })(),
        D.tier ? h('div', { key: 'tiernote', style: { fontSize: 10.5, color: C.label3, marginTop: 6 } },
          `${t('byLocalTier')}：${t('tierOffShort')} ${money(D.tier.offPeak?.cny ?? 0)} · ${t('tierPeakShort')} ${money(D.tier.peak?.cny ?? 0)}`) : null,
        h('div', { key: 'note', style: { fontSize: 10.5, marginTop: 6, lineHeight: 1.6 } }, t('rateFootnote')),
        hasThirdParty ? h('div', { key: 'third', style: { fontSize: 10.5, marginTop: 4, lineHeight: 1.6, color: C.warn } }, t('thirdPartyRateNote')) : null,
      ]),
    ]),

    // 渠道拆分：官方渠道 vs 第三方渠道（今日 / 近 30 天）
    h('div', { key: 'channels', style: { ...S.card, marginTop: 12 } }, [
      h(SectionTitle, { key: 'h', right: h('span', { key: 'n', style: { fontSize: 10.5 } }, `${channelStats.length} ${t('channelCol')}`) }, t('channelSplit')),
      h('div', { key: 'tb', style: { marginTop: 8, overflowX: 'auto' } }, h('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: 12.5 } }, [
        tableHead([t('channelCol'), t('channelToday'), t('channel30d')]),
        h('tbody', { key: 'tb' }, channelStats.map((row) => h('tr', { key: row.key }, [
          h('td', { key: 'n', style: cell({ color: C.label2, whiteSpace: 'nowrap' }) }, [
            row.official
              ? h('span', { key: 'tag', style: { fontSize: 10, padding: '1px 5px', borderRadius: 5, marginRight: 6, border: `1px solid ${C.border}`, color: C.brand, whiteSpace: 'nowrap' } }, t('officialChannel'))
              : (row.provider || t('thirdChannel')),
            !row.official && row.provider && channelRateKeys.includes(row.provider)
              ? h('span', { key: 'r', style: { fontSize: 10, color: C.label3, marginLeft: 6 } }, t('customRateTag')) : null,
          ]),
          h('td', { key: 't', style: cell({ ...rightAlign, fontWeight: 650, color: C.label }), title: `${fmt(row.today.tokens)} tokens` }, money(row.today.cny)),
          h('td', { key: 'm', style: cell({ ...rightAlign, color: C.label2 }), title: `${fmt(row.d30.tokens)} tokens` }, money(row.d30.cny)),
        ]))),
      ])),
      h('div', { key: 'note', style: { fontSize: 10.5, color: C.label3, marginTop: 6, lineHeight: 1.6 } }, t('channelNote')),
    ]),

    // 趋势
    h('div', { key: 'trend', style: S.card }, [
      h(SectionTitle, { key: 'h', right: h('div', { style: { display: 'flex', gap: 6 } }, [
        h(Chip, { key: 'r7', active: range === 7, onClick: () => setRange(7) }, t('range7')),
        h(Chip, { key: 'r30', active: range === 30, onClick: () => setRange(30) }, t('range30')),
        dataDays < 3 ? h('span', {
          key: 'few',
          style: { fontSize: 10.5, color: C.label3, border: `1px solid ${C.border}`, borderRadius: 999, padding: '1px 8px', whiteSpace: 'nowrap' },
        }, t('fewDays')) : null,
      ]) }, t('trend')),
      h('div', {
        key: 'bars',
        style: {
          position: 'relative', display: 'flex', alignItems: 'flex-end', gap: range > 10 ? 3 : 8,
          height: 108, marginTop: 16, justifyContent: trend_.length <= 4 ? 'center' : 'flex-start',
        },
      }, trend_.map(({ key, entry }) => {
        const total = entry ? entry.hit + entry.miss + entry.out : 0;
        const heightPct = total > 0 ? Math.max(4, (total / maxTotal) * 100) : 2;
        const isToday = key === today;
        const selected = selDay ? selDay === key : isToday;
        const label = `${key}${isToday ? ` · ${t('today')}` : ''}`;
        const tooltip = entry
          ? `${label}\n${t('cost')} ${money(entry.cny)} · ${entry.calls} ${t('calls')}\n${t('hitInput')} ${fmt(entry.hit)} · ${t('missInput')} ${fmt(entry.miss)} · ${t('output')} ${fmt(entry.out)}`
          : `${label} · ${t('zeroDays')}`;
        return h('div', {
          key,
          title: `${tooltip}\n${t('clickForSplit')}`,
          onClick: () => setSelDay(selDay === key ? null : key),
          style: {
            flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            outline: selected ? `1px dashed ${C.brand}` : 'none', outlineOffset: 2, borderRadius: 6,
            minWidth: 0, cursor: 'pointer', maxWidth: trend_.length <= 4 ? 78 : 'none', position: 'relative',
          },
        }, [
          total > 0 ? h('div', {
            key: 'val',
            style: {
              position: 'absolute', left: 0, right: 0, bottom: `calc(${heightPct}% + 5px)`, textAlign: 'center',
              fontSize: trend_.length <= 7 ? 10.5 : 9.5, fontWeight: 600, color: isToday ? C.brand : C.label2,
              fontVariantNumeric: 'tabular-nums', pointerEvents: 'none', whiteSpace: 'nowrap',
            },
          }, entry.cny > 0 ? (trend_.length <= 7 ? money(entry.cny) : `¥${Math.round(entry.cny)}`) : '') : null,
          total > 0 ? h('div', {
            key: 's',
            style: {
              height: `${heightPct}%`, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              borderRadius: '5px 5px 3px 3px', overflow: 'hidden', width: heightPct < 10 ? '46%' : '100%',
              alignSelf: 'center', minWidth: 6,
            },
          }, [
            h('div', { key: 'o', style: { flex: Math.max(entry.out, 1), minHeight: 3, background: C.out } }),
            h('div', { key: 'm', style: { flex: Math.max(entry.miss, 1), minHeight: 3, background: C.miss } }),
            h('div', { key: 'h', style: { flex: Math.max(entry.hit, 1), minHeight: 3, background: C.hit } }),
          ]) : h('div', {
            key: 'z',
            style: { height: '2%', minHeight: 2, background: 'var(--dsw-alias-border-l2, rgba(128,128,128,.3))', borderRadius: 3 },
          }),
        ]);
      })),
      h('div', {
        key: 'x',
        style: {
          display: 'flex', gap: range > 10 ? 3 : 8, marginTop: 6, paddingTop: 4,
          borderTop: `1px solid ${C.border1}`, justifyContent: trend_.length <= 4 ? 'center' : 'flex-start',
        },
      }, trend_.length > 31
        ? [h('div', { key: 'range', style: { flex: 1, textAlign: 'center', fontSize: 10, color: C.label3 } }, `${trend_[0].key.slice(5)} → ${trend_[trend_.length - 1].key.slice(5)}`)]
        : trend_.map(({ key }, index) => h('div', {
          key,
          style: {
            flex: 1, textAlign: 'center', fontSize: 10, minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap',
            color: key === today ? C.brand : C.label3, opacity: days[key] ? 1 : 0.4,
            fontWeight: key === today ? 700 : 400, maxWidth: trend_.length <= 4 ? 78 : 'none',
          },
        }, key === today ? t('today') : (index % 3 === 0 ? key.slice(5) : '')))),
      h('div', { key: 'hr', style: { marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border1}` } }, [
        h('div', { key: 'hh', style: { display: 'flex', alignItems: 'center', fontSize: 11.5, color: C.label3, gap: 8 } }, [
          h('span', { key: 't', style: { fontWeight: 650, color: C.label2 } }, t('byHour')),
          h('span', { key: 'sp', style: { flex: 1 } }),
          h('span', { key: 'p' }, `${String(peakHour).padStart(2, '0')}:00 · ${t('peakHourLabel')} ${fmt(maxHour)} tokens`),
        ]),
        h('div', { key: 'bars', style: { position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 2, height: 42, marginTop: 22 } }, [
          ...[50, 100].map((p) => h('div', { key: `grid${p}`, style: { position: 'absolute', left: 0, right: 0, bottom: `${p}%`, borderTop: `1px dashed ${C.border1}`, pointerEvents: 'none' } })),
          ...Array.from({ length: 24 }, (_, hour) => h('div', {
            key: hour,
            title: `${String(hour).padStart(2, '0')}:00 · ${fmt(D.byHour?.[hour] ?? 0)} tokens`,
            style: {
              position: 'relative', zIndex: 1, flex: 1, minHeight: 2,
              height: `${Math.max(((D.byHour?.[hour] ?? 0) / maxHour) * 100, 1.5)}%`,
              background: peakHoursToday[hour] ? C.miss : C.hit,
              opacity: hour === peakHour ? 1 : 0.72, borderRadius: '2px 2px 0 0',
            },
          })),
        ]),
        h('div', { key: 'ax', style: { display: 'flex', gap: 2, fontSize: 9, color: C.label3, marginTop: 4 } },
          Array.from({ length: 24 }, (_, hour) => h('span', {
            key: hour, style: { flex: 1, minWidth: 0, textAlign: 'center', fontVariantNumeric: 'tabular-nums' },
          }, String(hour).padStart(2, '0')))),
      ]),
    ]),

    // 成本构成
    h('div', { key: 'split', style: S.card }, [
      h(SectionTitle, { key: 'h', right: h('div', { style: { display: 'flex', gap: 8, alignItems: 'baseline' } }, [
        splitDay === today ? null : h('span', { key: 'back', onClick: () => setSelDay(null), style: { cursor: 'pointer', color: C.brand, userSelect: 'none' } }, `↩ ${t('today')}`),
        h('span', { key: 'tot', style: { color: C.label3, fontVariantNumeric: 'tabular-nums' } }, `${t('fromOfficial')} ${money((sHit + sMiss + sOut) || SD.cny || 0)}`),
      ]) }, `${splitDay === today ? t('costSplit') : `${t('costSplit')} · ${splitDay.slice(5)}`}`),
      h('div', { key: 'rows', style: { display: 'flex', flexDirection: 'column', gap: 9, marginTop: 10 } },
        [
          [t('output'), C.out, sOut, tokOf('out')],
          [t('missInput'), C.miss, sMiss, tokOf('miss')],
          [t('hitInput'), C.hit, sHit, tokOf('hit')],
        ].map(([label, color, cost, tokens]) => h('div', {
          key: label,
          style: { display: 'grid', gridTemplateColumns: '112px 84px 76px 1fr', gap: 10, alignItems: 'center', fontSize: 12 },
        }, [
          h('div', { key: 'n', style: { display: 'flex', alignItems: 'center', gap: 6, color: C.label2, whiteSpace: 'nowrap' } },
            [h('i', { key: 'i', style: swatch(color) }), label]),
          h('div', { key: 'k', style: { textAlign: 'right', fontSize: 11, color: C.label3, fontVariantNumeric: 'tabular-nums' } }, fmtM(tokens)),
          h('div', { key: 'v', style: { textAlign: 'right', fontWeight: 650, color: C.label, fontVariantNumeric: 'tabular-nums' } }, money(cost)),
          h('div', { key: 'tr', style: { display: 'flex', alignItems: 'center', paddingRight: 40 } }, [
            h('div', { key: 'track', style: { position: 'relative', flex: 1, minWidth: 0, height: 9, borderRadius: 99, background: 'var(--dsw-alias-border-l1, rgba(128,128,128,.18))' } }, [
              h('div', { key: 'fill', style: { height: '100%', width: `${pct(cost, splitTotal).toFixed(1)}%`, background: color, borderRadius: 99 } }),
              h('span', { key: 'p', style: { position: 'absolute', left: `calc(${pct(cost, splitTotal).toFixed(1)}% + 6px)`, top: -3, fontSize: 11, fontWeight: 600, color: C.label2, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' } }, `${pct(cost, splitTotal).toFixed(0)}%`),
            ]),
          ]),
        ]))),
    ]),

    // 历史（按天）
    (() => {
      const historyDays = Object.keys(days).sort().reverse().slice(0, 30)
        .map((key) => ({ date: key, ...(days[key] ?? {}) }))
        .filter((d) => (d.cny ?? 0) > 0 || (d.calls ?? 0) > 0);
      if (!historyDays.length) return null;
      return h('div', { key: 'hist', style: S.card }, [
        h(SectionTitle, { key: 'h', right: h('span', { key: 's', style: { fontSize: 10.5 } }, meterOfficial ? `platform.deepseek.com/api/v0/usage · ${historyDays.length} 天` : meterMixed ? `${t('mixedShort')} · ${historyDays.length} 天` : `${t('localShort')} · ${historyDays.length} 天`) }, t('historyTitle')),
        h('table', { key: 'tb', style: { width: '100%', borderCollapse: 'collapse', fontSize: 12.5, marginTop: 8 } }, [
          tableHead(['日期', t('cost'), t('hitInput'), t('missInput'), t('output'), t('callsShort')], ['left', 'right', 'right', 'right', 'right', 'right']),
          h('tbody', { key: 'tb' }, historyDays.map((d) => h('tr', { key: d.date }, [
            h('td', { key: 'd', style: cell({ color: d.date === today ? C.brand : C.label2, fontWeight: d.date === today ? 700 : 400, whiteSpace: 'nowrap' }) }, d.date),
            h('td', { key: 'c', style: cell({ ...rightAlign, fontWeight: 650, color: C.label }) }, money(d.cny)),
            h('td', { key: 'h', style: cell({ ...rightAlign, color: C.label2 }) }, fmt(d.hit)),
            h('td', { key: 'm', style: cell({ ...rightAlign, color: C.label2 }) }, fmt(d.miss)),
            h('td', { key: 'o', style: cell({ ...rightAlign, color: C.label2 }) }, fmt(d.out)),
            h('td', { key: 'n', style: cell({ ...rightAlign, color: C.label3 }) }, d.calls ?? 0),
          ]))),
        ]),
      ]);
    })(),

    // 本会话实时
    live ? h('div', { key: 'live', style: S.card }, [
      h(SectionTitle, { key: 'h', right: h('span', { key: 'n', style: { fontSize: 10.5 } }, t('liveHint')) }, t('live')),
      h('div', {
        key: 'g',
        style: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 10, marginTop: 10 },
      }, [
        h(Stat, { key: 'a', t, label: t('missInput'), color: C.miss, value: fmt(live.uncachedInputTokens) }),
        h(Stat, { key: 'b', t, label: t('hitInput'), color: C.hit, value: fmt(live.cacheReadTokens) }),
        h(Stat, { key: 'c', t, label: t('output'), color: C.out, value: fmt(live.outputTokens) }),
      ]),
    ]) : null,
  ]);

  /* ---------------- 明细 ---------------- */
  const detail = h('div', { key: 'detail' }, [
    h('div', { key: 'head', style: { ...S.card, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' } }, [
      h('div', { key: 't', style: { fontSize: 12.5, fontWeight: 650, color: C.label2 } }, t('detailTitle')),
      h('div', { key: 'chips', style: { display: 'flex', gap: 6, flexWrap: 'wrap' } }, [
        h(Chip, { key: 'today', active: detailRange === 'today', onClick: () => setDetailRange('today') }, t('rangeToday')),
        h(Chip, { key: '7d', active: detailRange === '7d', onClick: () => setDetailRange('7d') }, t('range7d')),
        h(Chip, { key: '30d', active: detailRange === '30d', onClick: () => setDetailRange('30d') }, t('range30d')),
        h(Chip, { key: 'month', active: detailRange === 'month', onClick: () => setDetailRange('month') }, t('rangeMonth')),
        h(Chip, { key: 'quarter', active: detailRange === 'quarter', onClick: () => setDetailRange('quarter') }, t('rangeQuarter')),
        h(Chip, { key: 'year', active: detailRange === 'year', onClick: () => setDetailRange('year') }, t('rangeYear')),
      ]),
      h('span', { key: 'sp', style: { flex: 1 } }),
      h('span', { key: 'tot', style: { fontSize: 11, color: C.label3, fontVariantNumeric: 'tabular-nums' } },
        `${t('detailTotals')} ¥${fmtMoney(detailTotals.cny)} · ${detailTotals.calls} ${t('calls')}`),
    ]),

    // 按模型
    h('div', { key: 'models', style: S.card }, [
      h(SectionTitle, { key: 'h', right: h('span', { key: 'n', style: { fontSize: 10.5 } }, `${modelRows.length} ${t('modelsUnit')}`) }, t('modelBreakdown')),
      modelRows.length === 0
        ? h('div', { key: 'e', style: { fontSize: 12, color: C.label3, padding: '12px 0' } }, t('noDataWindow'))
        : h('div', { key: 'tb', style: { marginTop: 8, overflowX: 'auto' } }, h('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: 12.5 } }, [
          tableHead([t('modelCol'), t('callsShort'), t('tokensCol'), t('cost'), t('shareCol')]),
          h('tbody', { key: 'tb' }, modelRows.map((row) => h('tr', { key: row.key }, [
            h('td', { key: 'm', style: cell({ color: C.label2, whiteSpace: 'nowrap' }), title: row.key }, row.key),
            h('td', { key: 'c', style: cell({ ...rightAlign, color: C.label2 }) }, row.calls),
            h('td', { key: 'k', style: cell({ ...rightAlign, color: C.label2 }) }, fmt(row.hit + row.miss + row.out)),
            h('td', { key: 'v', style: cell({ ...rightAlign, fontWeight: 650, color: C.label }) }, money(row.cny)),
            h('td', { key: 's', style: cell({ width: '22%' }) }, h(Progress, {
              value: pct(row.cny, modelTotalCny), height: 7,
              color: row.cny === 0 ? C.label3 : C.brand,
            })),
          ]))),
        ])),
    ]),

    // 按会话
    h('div', { key: 'sessions', style: S.card }, [
      h(SectionTitle, { key: 'h', right: h('div', { key: 'r', style: { display: 'flex', alignItems: 'center', gap: 8 } }, [
        h('input', {
          key: 'q',
          value: sessionQuery,
          onChange: (e) => setSessionQuery(e.target.value),
          placeholder: t('searchSessions'),
          style: {
            width: 200, padding: '3px 8px', fontSize: 11.5, borderRadius: 8,
            border: `1px solid ${C.border}`, background: 'transparent', color: C.label, fontFamily: 'inherit',
          },
        }),
        h('span', { key: 'n', style: { fontSize: 10.5 } }, `${filteredSessions.length} ${t('sessionsUnit')}`),
      ]) }, t('sessionsBreakdown')),
      filteredSessions.length === 0
        ? h('div', { key: 'e', style: { fontSize: 12, color: C.label3, padding: '12px 0' } }, sessionQuery ? t('noMatch') : t('noDataWindow'))
        : h('div', { key: 'tb', style: { marginTop: 8, overflowX: 'auto' } }, h('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: 12.5 } }, [
          tableHead([t('session'), t('lastCall'), t('tokensCol'), t('callsShort'), t('cost'), t('shareCol')]),
          h('tbody', { key: 'tb' }, filteredSessions.slice(0, showAllSessions ? filteredSessions.length : 12).map((s) => h('tr', { key: s.id }, [
            h('td', {
              key: 'n',
              title: s.title ?? s.id,
              style: cell({ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: C.label2 }),
            }, [
              s.isSubagent ? h('span', { key: 'tag', style: { fontSize: 10, padding: '1px 5px', borderRadius: 5, marginRight: 6, border: `1px solid ${C.border}`, color: C.label3, whiteSpace: 'nowrap' } }, t('subagent')) : null,
              s.title ?? `(${s.id.slice(0, 12)})`,
              s.workspace ? h('span', { key: 'w', style: { fontSize: 10, color: C.label3, marginLeft: 6 } }, s.workspace) : null,
            ]),
            h('td', { key: 't', style: cell({ ...rightAlign, color: C.label3 }) }, hhmm(s.lastTime)),
            h('td', { key: 'k', style: cell({ ...rightAlign, color: C.label2 }) }, fmt(s.hit + s.miss + s.out)),
            h('td', { key: 'c', style: cell({ ...rightAlign, color: C.label3 }) }, s.calls),
            h('td', { key: 'v', style: cell({ ...rightAlign, fontWeight: 650, color: C.label }) }, money(s.cny)),
            h('td', { key: 's', style: cell({ width: '18%' }) }, h(Progress, { value: pct(s.cny, maxSessionCny), height: 7, color: C.brand })),
          ]))),
          filteredSessions.length > 12 ? h('tfoot', { key: 'tf' }, h('tr', null, h('td', {
            colSpan: 6,
            onClick: () => setShowAllSessions((v) => !v),
            style: { padding: '7px 8px', fontSize: 11.5, color: C.brand, cursor: 'pointer', userSelect: 'none' },
          }, showAllSessions ? t('collapseSessions') : `${t('showAllSessions')} (${filteredSessions.length})`))) : null,
        ])),
    ]),

    // provider（统计窗口口径）
    providerRows.length > 1 ? h('div', { key: 'providers', style: S.card }, [
      h(SectionTitle, { key: 'h', right: h('span', { key: 'n', style: { fontSize: 10.5 } }, `${providerRows.length} provider`) }, t('providerBreakdown')),
      h('div', { key: 'list', style: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 } }, providerRows.map(([provider, value]) => h('div', {
        key: provider,
        style: { border: `1px solid ${C.border1}`, borderRadius: 10, padding: '6px 10px', fontSize: 11.5, display: 'flex', alignItems: 'baseline', gap: 8 },
      }, [
        h('span', { key: 'p', style: { color: C.label2, fontWeight: 600 } }, provider),
        h('span', { key: 't', style: { color: C.label3, fontVariantNumeric: 'tabular-nums' } }, `${fmt(value.tokens)} tokens`),
        h('span', { key: 'c', style: { color: C.label2, fontVariantNumeric: 'tabular-nums' } }, `¥${fmtMoney(value.cny)}`),
      ]))),
    ]) : null,
  ]);

  /* ---------------- 导出 ---------------- */
  const exportOption = (key, label, current, setter) => h('div', {
    key,
    onClick: () => setter(current === key ? current : key),
    style: {
      padding: '4px 12px', borderRadius: 8, cursor: 'pointer', userSelect: 'none', fontSize: 11.5,
      border: `1px solid ${current === key ? C.brand : C.border}`,
      background: current === key ? 'var(--dsw-alias-interactive-bg-hover, rgba(47,125,255,.12))' : 'transparent',
      color: current === key ? C.label : C.label3,
    },
  }, label);
  const exportRow = (label, options) => h('div', {
    key: label,
    style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: 11.5, color: C.label3 },
  }, [h('span', { key: 'l', style: { width: 44, flex: 'none' } }, label), ...options]);

  const commandLines = [
    'node tools/report.mjs --days 7',
    'node tools/report.mjs --json',
    'node tools/report.mjs --csv daily',
  ];
  const apiLines = [
    `GET ${ROUTE_BASE}/export?dataset=daily&scope=7d&format=csv`,
    `GET ${ROUTE_BASE}/export?dataset=sessions&scope=30d&format=json`,
    `GET ${ROUTE_BASE}/export?dataset=models&scope=all&format=csv`,
  ];
  const codeBlock = (key, lines) => h('div', { key, style: { marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 } },
    lines.map((line) => h('div', { key: line, style: { display: 'flex', alignItems: 'center', gap: 8 } }, [
      h('code', {
        key: 'c',
        style: {
          flex: 1, fontSize: 11, padding: '5px 8px', borderRadius: 7, background: C.layer2,
          color: C.label2, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', overflow: 'auto', whiteSpace: 'nowrap',
        },
      }, line),
      h('span', {
        key: 'cp',
        onClick: () => copyText(line, line),
        style: { cursor: 'pointer', color: C.brand, fontSize: 11, userSelect: 'none', whiteSpace: 'nowrap' },
      }, copied === line ? t('copiedShort') : t('copy')),
    ])));

  const exportView = h('div', { key: 'export' }, [
    h('div', { key: 'main', style: S.card }, [
      h(SectionTitle, { key: 'h' }, t('exportTitle')),
      h('div', { key: 'hint', style: { fontSize: 11, color: C.label3, marginTop: 4, lineHeight: 1.7 } }, t('exportHint')),
      h('div', { key: 'opts', style: { display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 } }, [
        exportRow(t('dataset'), [
          exportOption('daily', t('dsDaily'), exportDataset, setExportDataset),
          exportOption('sessions', t('dsSessions'), exportDataset, setExportDataset),
          exportOption('models', t('dsModels'), exportDataset, setExportDataset),
        ]),
        exportRow(t('scope'), [
          exportOption('today', t('scopeToday'), exportScope, setExportScope),
          exportOption('7d', t('scope7d'), exportScope, setExportScope),
          exportOption('30d', t('scope30d'), exportScope, setExportScope),
          exportOption('month', t('scopeMonth'), exportScope, setExportScope),
          exportOption('quarter', t('scopeQuarter'), exportScope, setExportScope),
          exportOption('year', t('scopeYear'), exportScope, setExportScope),
          exportOption('all', t('scopeAll'), exportScope, setExportScope),
        ]),
        exportRow(t('format'), [
          exportOption('csv', 'CSV', exportFormat, setExportFormat),
          exportOption('json', 'JSON', exportFormat, setExportFormat),
        ]),
      ]),
      h('div', { key: 'actions', style: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 } }, [
        h('button', {
          key: 'dl',
          onClick: doExport,
          disabled: exportState.busy,
          style: {
            padding: '7px 16px', borderRadius: 9, cursor: exportState.busy ? 'default' : 'pointer',
            border: `1px solid ${C.brand}`, background: 'var(--dsw-alias-interactive-bg-hover, rgba(47,125,255,.12))',
            color: C.brand, fontSize: 12, fontWeight: 650, opacity: exportState.busy ? 0.6 : 1,
          },
        }, exportState.busy ? t('exporting') : t('download')),
        exportState.error ? h('span', { key: 'e', style: { fontSize: 11.5, color: C.error } }, `${t('exportFailed')}：${exportState.error}`) : null,
        exportState.done ? h('span', { key: 'd', style: { fontSize: 11.5, color: C.ok } }, `${t('exportDone')} · ${exportState.done}`) : null,
      ]),
      h('div', { key: 'note', style: { fontSize: 10.5, color: C.label3, marginTop: 10, lineHeight: 1.7 } }, t('localOnlyNote')),
    ]),
    h('div', { key: 'cli', style: S.card }, [
      h(SectionTitle, { key: 'h' }, t('cliTitle')),
      h('div', { key: 'hint', style: { fontSize: 11, color: C.label3, marginTop: 4 } }, t('cliHint')),
      codeBlock('code', commandLines),
    ]),
    h('div', { key: 'api', style: S.card }, [
      h(SectionTitle, { key: 'h' }, t('apiTitle')),
      h('div', { key: 'hint', style: { fontSize: 11, color: C.label3, marginTop: 4 } }, t('apiHint')),
      codeBlock('code', apiLines),
    ]),
  ]);

  /* ---------------- 页脚 ---------------- */
  const footer = h('div', { key: 'foot', style: { marginTop: 12, fontSize: 11, color: C.label3, lineHeight: 1.8 } }, [
    h('div', { key: 'ab' },
      `${t('updated')} ${clock(at || data.generatedAt)} · ${t('partial')}${data.partialScan ? ` · ${t('scanning')}` : ''}`
      + ` · ${data.filesScanned} 个会话文件${data.filesReused > 0 ? `（复用 ${data.filesReused}）` : ''} · 扫描 ${data.elapsedMs}ms`
      + (data.filesOutsideWindow > 0 ? ` · 窗口外 ${data.filesOutsideWindow}` : '')
      + ` · ${t('estimateNote')}`),
    h('div', { key: 'ver', style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 2 } }, [
      h('span', { key: 'n' }, `${plugin.name ?? PKG_NAME} v${plugin.version ?? '?'}`),
      h('span', { key: 's1' }, '·'),
      h('a', {
        key: 'lic',
        href: `${plugin.repo ?? `https://github.com/${'catgrandfa/dsh-token-cost'}`}/blob/main/LICENSE`,
        target: '_blank', rel: 'noreferrer',
        style: { color: C.label3, textDecoration: 'underline' },
      }, `${plugin.license ?? 'MIT'} ${t('licenseLabel')}`),
      update?.hasUpdate ? h('span', { key: 'up', style: { display: 'flex', alignItems: 'center', gap: 6, marginLeft: 4 } }, [
        h('span', { key: 'b', style: { color: C.warn, fontWeight: 600, padding: '1px 7px', borderRadius: 999, border: `1px solid ${C.warn}` } }, `${t('updateAvailable')} v${update.latest}`),
        h('span', { key: 'st', style: { color: update.error ? C.error : C.label3 } },
          update.applied ? t('updateApplied') : update.running ? t('updateRunning') : update.error ? t('updateFailed') : t('updateAuto')),
        h('span', {
          key: 'cp',
          onClick: () => copyText('update', update.command),
          style: { cursor: 'pointer', color: C.brand, userSelect: 'none' },
        }, copied === 'update' ? t('copied') : t('copyCmd')),
        h('a', { key: 'd', href: update.url, target: '_blank', rel: 'noreferrer', style: { color: C.brand, textDecoration: 'none' } }, `${t('viewRelease')} ↗`),
      ]) : null,
    ]),
    error ? h('div', { key: 'd', style: { color: C.warn } }, `${t('failed')}：${error}`) : null,
  ]);

  /* ---------------- 根 ---------------- */
  return h('div', {
    style: {
      height: '100%', overflow: 'auto', padding: '16px 18px 40px', position: 'relative',
      color: C.label, fontFamily: 'var(--dsw-font-family, system-ui, "Microsoft YaHei UI", sans-serif)',
      fontSize: 13, boxSizing: 'border-box',
    },
  }, [
    glassOn ? h('div', {
      key: 'aurora',
      'aria-hidden': 'true',
      style: {
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden',
        background: [
          'color-mix(in srgb, var(--dsw-alias-bg-layer-1) 16%, transparent)',
          'radial-gradient(50% 32% at 14% 0%, color-mix(in srgb, var(--dsw-alias-brand-primary, #2f7dff) 55%, transparent), transparent 66%)',
          'radial-gradient(38% 28% at 98% 6%, rgba(150,96,255,.42), transparent 70%)',
          'radial-gradient(44% 30% at 78% 100%, rgba(0,196,178,.34), transparent 72%)',
          'radial-gradient(32% 24% at 22% 92%, rgba(255,120,190,.22), transparent 72%)',
        ].join(','),
        filter: 'blur(40px) saturate(140%)', transform: 'translateZ(0)',
      },
    }) : null,
    h('div', { key: 'body', style: { position: 'relative', zIndex: 1 } }, [
      h('div', { key: 'head', style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 } }, [
        h('div', { key: 'ti', style: { minWidth: 0 } }, [
          h('div', { key: 'l1', style: { fontWeight: 700, fontSize: 15 } }, [
            t('title'),
            h('span', { key: 's', style: { fontWeight: 500, fontSize: 12, color: C.label3, marginLeft: 6 } }, `· ${t('subtitle')}`),
          ]),
        ]),
        h('div', { key: 'sp', style: { flex: 1 } }),
      ]),
      h('div', { key: 'tabs', style: { display: 'flex', gap: 8, marginBottom: 12 } }, [
        tabButton('overview', t('tabOverview')),
        tabButton('detail', t('tabDetail')),
        tabButton('export', t('tabExport')),
      ]),
      view === 'overview' ? overview : null,
      view === 'detail' ? detail : null,
      view === 'export' ? exportView : null,
      footer,
    ]),
  ]);
}



/* ------------------------------------------------------------------ *
 * 插件体
 * ------------------------------------------------------------------ */
export const inject = ['slots', 'locale'];

export function apply(ctx) {
  ctx.effect(() => ctx.locale.register(LOCALE_NS, { zh, en }), `${LOCALE_NS}: dictionaries`);

  /* 侧栏入口：图标 + 今日花费预览。
   * sidebar.panellist 的 label 只在注册 / locale 变化时被解析（resolveSlotLabel），
   * 因此金额变化时重注册这一行（dispose → register），id 不变，选中状态与 main 面板不受影响。
   * 数据优先复用面板的 lastSummary（同一模块内共享，零额外请求）；面板从未打开时，
   * 插件运行 45 秒后每 2 分钟轻量拉一次 /summary（宿主有增量缓存）。 */
  let sidebarCost = null;
  let entryDispose = null;
  const sidebarLabel = () => (sidebarCost == null ? 'Token' : `Token · ¥${fmtMoney(sidebarCost)}`);
  const mountSidebarEntry = () => {
    if (!ctx.slots?.register) return;
    try { entryDispose?.(); } catch { /* 旧的已经释放 */ }
    try {
      entryDispose = ctx.slots.register({
        name: 'sidebar.panellist',
        id: SLOT_ID,
        order: 90,
        label: sidebarLabel,
        locale: LOCALE_NS,
      }, (props) => React.createElement(MeterIcon, { size: props?.size ?? 16, active: props?.active }));
    } catch {
      // 极端情况（slot 已被卸载）：侧栏入口先空着，下一次 tick 会重试；不影响面板
      entryDispose = null;
    }
  };
  ctx.slots.inject('sidebar.panellist', () => {
    mountSidebarEntry();
    return () => {
      try { entryDispose?.(); } catch { /* ignore */ }
      entryDispose = null;
    };
  });

  const applySidebarCost = (summary) => {
    if (!summary?.days) return;
    const cny = Number(summary.days[summary.today]?.cny ?? 0);
    if (!Number.isFinite(cny) || cny === sidebarCost) return;
    sidebarCost = cny;
    mountSidebarEntry();
  };
  const mountedAt = Date.now();
  let lastScanAt = 0;
  ctx.effect(() => {
    const tick = async () => {
      if (!entryDispose) mountSidebarEntry(); // 上次重注册失败（slot 短暂不可用）则重试
      // 面板已打开：直接复用它的缓存，不产生请求
      if (lastSummary && Date.now() - lastSummary.at < 5 * 60 * 1000) {
        applySidebarCost(lastSummary.data);
        return;
      }
      // 面板从未打开：等启动稳定后再拉一次，避免和 DSH 启动抢资源
      if (Date.now() - mountedAt < 45 * 1000) return;
      if (Date.now() - lastScanAt < 120 * 1000) return;
      lastScanAt = Date.now();
      try {
        const response = await fetch(`${ROUTE_BASE}/summary`, { cache: 'no-store', credentials: 'same-origin' });
        const body = await response.json();
        if (body?.ok) applySidebarCost(body.data);
      } catch { /* 侧栏预览失败不影响面板 */ }
    };
    const timer = setInterval(tick, 20 * 1000);
    tick();
    return () => clearInterval(timer);
  }, 'token-cost: sidebar preview');

  // 中栏独立面板
  ctx.slots.inject('main', () => ctx.slots.register({
    name: 'main',
    key: SLOT_ID,
    locale: LOCALE_NS,
  }, TokenMeterPanel));
}
