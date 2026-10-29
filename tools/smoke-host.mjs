/**
 * 宿主半侧烟测：不启动 DSH，直接 import 插件模块，用一个假的 ctx 调用 apply()，
 * 检查：路由是否注册、schema 是否成立、聚合是否能出数、设置读写是否生效。
 * 需要能解析 @deepseek-ai/schemastery —— 本机解析不到时会退化成「无 schema」，仍可跑完。
 * 另外覆盖两条余额路径（账号 / API Key）与两种桌面布局的更新通道解析（macOS / Windows）。
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

/** 本次烟测的插件本机设置文件：别碰真实的 ~/.dsh/token-cost 配置 */
const SMOKE_SETTINGS = join(tmpdir(), `dsh-token-cost-settings-${process.pid}.json`);

// 用相对本文件的路径，别写死任何人的机器路径；URL 本身就是合法的 import specifier
const target = new URL('../lib/index.js', import.meta.url).href;
let mod;
try {
  mod = await import(target);
} catch (error) {
  console.error('IMPORT FAILED:', error.message);
  process.exit(1);
}
console.log('exports:', Object.keys(mod).join(', '));
console.log('name:', mod.name);
console.log('inject:', JSON.stringify(mod.inject));
console.log('Config schema present:', typeof mod.Config === 'object' && mod.Config !== null);

const routes = [];
const effects = [];
const logs = [];
const settingStore = { registered: null, watchers: [] };
const fakeSettings = {
  register(ns, schema, opts) {
    settingStore.registered = { ns, schema, opts };
    return {
      get: () => ({
        dailyBudget: 50, monthlyBudget: 0, alertAtPercent: 80, showBalance: true, officialOnly: true,
        apiKeyEnv: 'DEEPSEEK_API_KEY', refreshSeconds: 60,
        offPeak: { 'deepseek-flash': { cacheHit: 0.02, cacheMiss: 1, output: 4 }, 'deepseek-v4-pro': { cacheHit: 0.15, cacheMiss: 4.5, output: 13.5 } },
        peak: { 'deepseek-flash': { cacheHit: 0.04, cacheMiss: 2, output: 8 }, 'deepseek-v4-pro': { cacheHit: 0.3, cacheMiss: 9, output: 27 } },
      }),
      watch(cb) { settingStore.watchers.push(cb); return () => { settingStore.watchers.length = 0; }; },
      update(patch) { settingStore.updated = patch; }, replace() {},
    };
  },
};
const ctx = {
  settings: fakeSettings,
  // 官方账号服务（桌面端账号登录）：余额走这里，不需要 API Key。
  // 返回形状与 @deepseek-ai/dsh-deepseek-account-platform 一致：
  //   { status: 'ready', value: normal_wallets(充值), bonusWallets: bonus_wallets(赠送) }
  deepseekAccount: {
    async getBalance(client) {
      settingStore.balanceClient = client;
      return {
        status: 'ready',
        value: [{ currency: 'CNY', balance: '12.34' }],
        bonusWallets: [{ currency: 'CNY', balance: '1.66' }],
      };
    },
    // 官方用量：桌面端账号会话（x-dsh-auth-token，免网页登录）
    async getPlatformSession() {
      return {
        origin: 'https://platform.deepseek.com',
        token: 'acct-session-token',
        requestHeaders: { 'x-client-platform': 'desktop-mac', 'x-client-version': '0.2.0-rc.2' },
      };
    },
  },
  webServer: {
    register(spec) {
      routes.push(spec);
      return () => { const i = routes.indexOf(spec); if (i >= 0) routes.splice(i, 1); };
    },
  },
  get(name) { return name === 'credentials' ? undefined : ctx[name]; },
  logger: Object.assign((name) => ({ info: (m) => logs.push(['info', name ? `[${name}] ${m}` : m]), warn: (m) => logs.push(['warn', m]), error: (m) => logs.push(['error', m]), debug: () => {} }), {
    info: (m) => logs.push(['info', m]),
    warn: (m) => logs.push(['warn', m]),
    error: (m) => logs.push(['error', m]),
    debug: () => {},
  }),
  // Cordis 的 ctx.inject(names, cb) 是反应式依赖：服务就绪后回调执行，服务消失则子 fiber 卸载。
  // 这里服务已在位，因此同步触发回调并收集它注册的 effect。
  inject(names, callback) {
    const scoped = Object.create(this);
    scoped.effect = (cb, label) => { effects.push({ label, dispose: cb() }); return { dispose() {} }; };
    callback(scoped);
    return { dispose() {} };
  },
  effect(cb, label) { effects.push({ label, dispose: cb() }); return { dispose() {} }; },
};

await mod.apply(ctx, { settingsPath: SMOKE_SETTINGS });
// 设置 namespace 的注册要等 schemastery 动态导入完成，让出一个 tick 再看结果
await new Promise((resolve) => setTimeout(resolve, 50));
console.log('\n--- registered routes ---');
for (const r of routes) console.log(`  ${r.kind} ${r.path}`);
console.log('--- effects ---');
for (const e of effects) console.log(`  ${e.label ?? '(unlabeled)'} -> disposer=${typeof e.dispose}`);
console.log('--- settings namespace ---', settingStore.registered?.ns, 'base=', JSON.stringify(settingStore.registered?.opts));
console.log('--- logs ---');
for (const [lvl, m] of logs) console.log(`  ${lvl}: ${m}`);

// 打一次真实路由：/token-cost/health
const health = routes.find((r) => r.path.endsWith('/health'));
if (health) {
  let body = '', status = 0;
  const res = { writeHead: (s) => { status = s; }, end: (b) => { body = b; } };
  await health.handler({ method: 'GET', url: '/token-cost/health' }, res);
  console.log(`\nGET /token-cost/health -> ${status}`);
  console.log(body.slice(0, 400));
}

// 打一次真实路由：/token-cost/summary（真扫会话目录）
const sum = routes.find((r) => r.path.endsWith('/summary'));
if (sum) {
  const t0 = Date.now();
  let body = '', status = 0;
  const res = { writeHead: (s) => { status = s; }, end: (b) => { body = b; } };
  await sum.handler({ method: 'GET', url: '/token-cost/summary?refresh=1' }, res);
  const parsed = JSON.parse(body);
  console.log(`\nGET /token-cost/summary -> ${status} in ${Date.now() - t0}ms`);
  if (parsed.ok) {
    const d = parsed.data;
    console.log(`  files=${d.filesScanned} calls=${d.calls} days=${Object.keys(d.days).length} sessions=${Object.keys(d.sessions).length} elapsed=${d.elapsedMs}ms today=${d.today} peakNow=${d.peakNow}`);
    console.log(`  today bucket: ${JSON.stringify(d.days[d.today] ?? null).slice(0, 220)}`);
  } else {
    console.log('  error:', parsed.error);
  }
}

// ---- 余额路由：账号路径必须真的出数（这是桌面端默认形态） ----
// 回归点：早先只实现了 API Key 路径，账号登录的用户永远只看到「未配置凭据」。
const bal = routes.find((r) => r.path.endsWith('/balance'));
let smokeFailures = 0;

// ---- 会话根解析：优先用官方库 @deepseek-ai/dsh-home-paths（与整个 harness 同一套规则），
//      解析不到时退回等价实现（$DSH_HOME 优先、空白环境变量视为未设置） ----
{
  let officialLib = false;
  try { await import('@deepseek-ai/dsh-home-paths'); officialLib = true; } catch { /* 回退实现 */ }
  const root = await mod.resolveSessionsRoot({});
  const absolute = typeof root === 'string' && (root.startsWith('/') || /^[A-Za-z]:[\\/]/.test(root));
  const rootOk = absolute && /sessions[\\/]?$/.test(root);
  const explicit = await mod.resolveSessionsRoot({ sessionsRoot: '/tmp/explicit-sessions' });
  console.log('\n-- 会话根解析 --');
  console.log(`  ${rootOk ? 'PASS' : 'FAIL'} ${root}（官方 home-paths 库${officialLib ? '可用 → 已使用' : '不可用 → 回退实现'}）`);
  console.log(`  ${explicit === '/tmp/explicit-sessions' ? 'PASS' : 'FAIL'} 组合配置显式指定优先：${explicit}`);
  if (!rootOk) smokeFailures += 1;
  if (explicit !== '/tmp/explicit-sessions') smokeFailures += 1;
}

if (bal) {
  const call = async (url) => {
    let body = '', status = 0;
    const res = { writeHead: (s) => { status = s; }, end: (b) => { body = b; } };
    await bal.handler({ method: 'GET', url }, res);
    return { status, payload: JSON.parse(body)?.data };
  };

  // 打桩：宿主取累计消费会请求 get_user_summary、取官方用量会请求 by_api_key/*，都别打真网络
  const realFetchForAccount = globalThis.fetch;
  const usageEmpty = (bucket) => ({
    code: 0,
    data: { biz_code: 0, biz_data: { start: 0, end: 0, bucket, models: ['deepseek-flash'], series: [], data: [] } },
  });
  globalThis.fetch = async (url, init) => {
    const target = String(url);
    if (target.includes('/api/v0/usage/by_api_key/')) {
      if (init?.headers?.['x-dsh-auth-token'] !== 'acct-session-token') throw new Error('官方用量没有走账号会话头 x-dsh-auth-token');
      return { ok: true, status: 200, json: async () => usageEmpty(target.includes('tz=') && Number(new URL(target).searchParams.get('start')) + 86400 >= Number(new URL(target).searchParams.get('end')) ? 3600 : 86400) };
    }
    if (!target.includes('/api/v0/users/get_user_summary')) throw new Error(`unexpected fetch: ${target}`);
    if (init?.headers?.['x-dsh-auth-token'] !== 'acct-session-token') throw new Error('累计消费没有带账号会话 token');
    return {
      ok: true, status: 200,
      json: async () => ({ data: { biz_data: { total_costs: [{ currency: 'CNY', amount: '38.6617931000000000' }] } } }),
    };
  };
  const account = await call('/token-cost/balance?locale=zh-CN&refresh=1');
  const info = account.payload?.balance_infos?.[0];
  const accountOk = account.payload?.ok === true
    && account.payload?.source === 'account'
    && info?.currency === 'CNY'
    && info?.topped_up_balance === '12.34'
    && info?.granted_balance === '1.66'
    && info?.total_balance === '14.00'; // 12.34 + 1.66：十进制字符串相加不能写成 13.999999999
  const costOk = account.payload?.total_costs?.length === 1
    && account.payload.total_costs[0].currency === 'CNY'
    && account.payload.total_costs[0].amount === '38.6617931000000000';
  const clientOk = settingStore.balanceClient?.timezoneOffsetSeconds !== undefined
    && typeof settingStore.balanceClient?.version === 'string';
  console.log(`\nGET /token-cost/balance (账号路径) -> ${account.status} ${JSON.stringify(account.payload)}`);
  console.log(`  ${accountOk ? 'PASS' : 'FAIL'} 账号余额映射（total=${info?.total_balance} 充值=${info?.topped_up_balance} 赠送=${info?.granted_balance}）`);
  console.log(`  ${clientOk ? 'PASS' : 'FAIL'} 传了官方平台要求的调用方元数据（version/locale/timezoneOffsetSeconds）`);
  console.log(`  ${costOk ? 'PASS' : 'FAIL'} 官方累计消费（total_costs=${JSON.stringify(account.payload?.total_costs)}）`);
  if (!accountOk) smokeFailures += 1;
  if (!costOk) smokeFailures += 1;
  if (!clientOk) smokeFailures += 1;

  // 回退路径：没有账号服务、也没有凭据时，应明确说明而不是抛错
  const routes2 = [];
  const ctx2 = {
    settings: {
      register: () => ({
        get: () => ({
          dailyBudget: 50, showBalance: true, apiKeyEnv: 'DEEPSEEK_API_KEY', officialOnly: true, refreshSeconds: 60,
          offPeak: { 'deepseek-flash': { cacheHit: 0.02, cacheMiss: 1, output: 4 }, 'deepseek-v4-pro': { cacheHit: 0.15, cacheMiss: 4.5, output: 13.5 } },
          peak: { 'deepseek-flash': { cacheHit: 0.04, cacheMiss: 2, output: 8 }, 'deepseek-v4-pro': { cacheHit: 0.3, cacheMiss: 9, output: 27 } },
        }),
        watch: () => () => {},
        update() {}, replace() {},
      }),
    },
    webServer: { register: (spec) => { routes2.push(spec); return () => {}; } },
    get: () => undefined,
    logger: Object.assign(() => ({ info() {}, warn() {}, error() {}, debug() {} }), { info() {}, warn() {}, error() {}, debug() {} }),
    inject(names, cb) { const s = Object.create(this); s.effect = (fn) => { fn(); return { dispose() {} }; }; cb(s); return { dispose() {} }; },
    effect(cb) { cb(); return { dispose() {} }; },
  };
  await mod.apply(ctx2, {});
  await new Promise((resolve) => setTimeout(resolve, 30));
  const bal2 = routes2.find((r) => r.path.endsWith('/balance'));
  let body2 = '';
  await bal2.handler({ method: 'GET', url: '/token-cost/balance' }, { writeHead: () => {}, end: (b) => { body2 = b; } });
  const fallback = JSON.parse(body2)?.data;
  const fallbackOk = fallback?.ok === false && fallback?.source === 'apikey' && /未配置凭据|账号未登录/.test(fallback?.error ?? '');
  console.log(`  ${fallbackOk ? 'PASS' : 'FAIL'} 无账号、无凭据时回退 API Key 并给出明确原因：${fallback?.error}`);
  if (!fallbackOk) smokeFailures += 1;
}

/**
 * 造一个独立的假 ctx（每个场景一份，互不污染）。
 * @param {{account?:object, credentials?:object, showBalance?:boolean}} opts
 */
function newCtx(opts = {}) {
  const list = [];
  const settingsFor = () => ({
    dailyBudget: 50, alertAtPercent: 80, showBalance: opts.showBalance !== false, officialOnly: true,
    apiKeyEnv: 'DEEPSEEK_API_KEY', refreshSeconds: 60,
    offPeak: { 'deepseek-flash': { cacheHit: 0.02, cacheMiss: 1, output: 4 }, 'deepseek-v4-pro': { cacheHit: 0.15, cacheMiss: 4.5, output: 13.5 } },
    peak: { 'deepseek-flash': { cacheHit: 0.04, cacheMiss: 2, output: 8 }, 'deepseek-v4-pro': { cacheHit: 0.3, cacheMiss: 9, output: 27 } },
    ...(opts.settings ?? {}),
  });
  const ctx = {
    settings: { register: () => ({ get: settingsFor, watch: () => () => {}, update() {}, replace() {} }) },
    webServer: { register: (spec) => { list.push(spec); return () => {}; } },
    get(name) {
      if (name === 'deepseekAccount') return opts.account ?? undefined;
      if (name === 'credentials') return opts.credentials ?? undefined;
      return ctx[name];
    },
    logger: Object.assign(() => ({ info() {}, warn() {}, error() {}, debug() {} }), { info() {}, warn() {}, error() {}, debug() {} }),
    inject(names, cb) { const s = Object.create(this); s.effect = (fn) => { fn(); return { dispose() {} }; }; cb(s); return { dispose() {} }; },
    effect(cb) { cb(); return { dispose() {} }; },
  };
  if (opts.account) ctx.deepseekAccount = opts.account;
  return { ctx, routes: list };
}

/** 挂载插件并把某个路由的响应体取回来 */
async function callRoute(ctxRoutes, path, url, method = 'GET') {
  const route = ctxRoutes.find((r) => r.path.endsWith(path));
  let body = '', status = 0;
  await route.handler({ method, url }, { writeHead: (s) => { status = s; }, end: (b) => { body = b; } });
  return { status, payload: JSON.parse(body)?.data ?? JSON.parse(body) };
}

// ---- API Key 路径（回退）：账号未登录时，必须真的按官方 /user/balance 协议发请求 ----
{
  console.log('\n-- API Key 回退路径 --');
  const realFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), headers: init?.headers ?? {} });
    return {
      ok: true, status: 200,
      json: async () => ({ is_available: true, balance_infos: [{ currency: 'CNY', total_balance: '8.80', granted_balance: '0.00', topped_up_balance: '8.80' }] }),
    };
  };
  try {
    const { ctx: ctx3, routes: r3 } = newCtx({ credentials: { resolve: async () => ({ value: 'sk-test-key' }) } });
    await mod.apply(ctx3, {});
    await new Promise((resolve) => setTimeout(resolve, 30));
    const got = await callRoute(r3, '/balance', '/token-cost/balance?refresh=1&locale=en-US');
    const apiOk = got.payload?.ok === true
      && got.payload?.source === 'apikey'
      && got.payload?.balance_infos?.[0]?.total_balance === '8.80'
      && calls[0]?.url === 'https://api.deepseek.com/user/balance'
      && calls[0]?.headers?.authorization === 'Bearer sk-test-key';
    console.log(`  ${apiOk ? 'PASS' : 'FAIL'} url=${calls[0]?.url} auth=${String(calls[0]?.headers?.authorization).replace(/sk-.*/, 'sk-***')} total=${got.payload?.balance_infos?.[0]?.total_balance}`);
    if (!apiOk) smokeFailures += 1;
  } finally {
    globalThis.fetch = realFetch;
  }
}

// ---- 更新通道解析：Windows 桌面布局（resources/app.asar）与 macOS 布局（Contents/Resources） ----
{
  console.log('\n-- 更新通道解析（两种桌面布局）--');
  const sim = join(tmpdir(), 'dsh-desktop-layout-sim');
  rmSync(sim, { recursive: true, force: true });
  // Windows: <install>/DSH Desktop.exe + <install>/resources/app.asar
  // 注意：app.asar 是**文件**；它内部的 cli.js 路径普通 fs 看不到（要靠 Electron 的 asar 支持），
  // 所以这里只造出归档文件本身，解析器判断的也正是它。
  const winRoot = join(sim, 'win');
  mkdirSync(join(winRoot, 'resources'), { recursive: true });
  writeFileSync(join(winRoot, 'resources', 'app.asar'), '');
  // macOS: <app>/Contents/MacOS/<exe> + <app>/Contents/Resources/app.asar
  const macRoot = join(sim, 'mac', 'DSH.app', 'Contents');
  mkdirSync(join(macRoot, 'Resources'), { recursive: true });
  writeFileSync(join(macRoot, 'Resources', 'app.asar'), '');
  mkdirSync(join(macRoot, 'MacOS'), { recursive: true });

  const realExec = process.execPath;
  const checkLayout = async (label, execPath, expectFragment) => {
    Object.defineProperty(process, 'execPath', { value: execPath, configurable: true });
    const { ctx, routes: r } = newCtx();
    await mod.apply(ctx, {});
    await new Promise((resolve) => setTimeout(resolve, 30));
    const got = await callRoute(r, '/health', '/token-cost/health');
    const ch = got.payload?.updateChannel;
    const ok = ch?.kind === 'desktop-cli'
      && String(ch?.cli ?? '').replace(/\\/g, '/').includes(expectFragment);
    console.log(`  ${ok ? 'PASS' : 'FAIL'} ${label}: kind=${ch?.kind} cli=${ch?.cli}`);
    if (!ok) smokeFailures += 1;
  };
  try {
    await checkLayout('Windows 布局', join(winRoot, 'DSH Desktop.exe'), '/resources/app.asar/dsh/');
    await checkLayout('macOS 布局', join(macRoot, 'MacOS', 'DeepSeek Harness'), '/Contents/Resources/app.asar/dsh/');
  } finally {
    Object.defineProperty(process, 'execPath', { value: realExec, configurable: true });
    rmSync(sim, { recursive: true, force: true });
  }
}

// ---- 导出路由 + 面板内改设置（预算写回）----
{
  console.log('\n-- 导出路由 / 面板内改设置 --');
  const callExport = async (url, method = 'GET') => {
    const route = routes.find((r) => r.path.endsWith('/export'));
    let body = '', status = 0, headers = {};
    await route.handler({ method, url }, {
      writeHead: (s, h) => { status = s; headers = h ?? {}; }, end: (b) => { body = b; },
    });
    return { status, headers, body };
  };
  const csv = await callExport('/token-cost/export?dataset=daily&scope=30d&format=csv');
  const csvOk = csv.status === 200
    && /^date,cny,cache_hit_tokens,cache_miss_tokens,output_tokens,calls,hit_rate/.test(csv.body)
    && /attachment; filename="dsh-token-cost-daily-30d-/.test(csv.headers['content-disposition'] ?? '');
  console.log(`  ${csvOk ? 'PASS' : 'FAIL'} CSV 表头与下载头：${String(csv.body).split('\r\n')[0]?.slice(0, 60)}…`);
  if (!csvOk) smokeFailures += 1;

  const json = await callExport('/token-cost/export?dataset=sessions&scope=7d&format=json');
  const parsed = JSON.parse(json.body);
  const jsonOk = json.status === 200 && parsed.dataset === 'sessions' && parsed.scope === '7d'
    && Array.isArray(parsed.rows) && parsed.source === 'local'
    && json.headers['content-type']?.includes('application/json');
  console.log(`  ${jsonOk ? 'PASS' : 'FAIL'} JSON 导出：dataset=${parsed.dataset} scope=${parsed.scope} rows=${parsed.rows?.length} source=${parsed.source}`);
  if (!jsonOk) smokeFailures += 1;

  const bad = await callExport('/token-cost/export?dataset=nope&scope=nope&format=nope');
  const badOk = bad.status === 200 && /^date,cny,/.test(bad.body);
  console.log(`  ${badOk ? 'PASS' : 'FAIL'} 非法参数回落到 daily/7d/csv（不报错）`);
  if (!badOk) smokeFailures += 1;

  const modelsCsv = await callExport('/token-cost/export?dataset=models&scope=30d&format=csv');
  const modelsOk = modelsCsv.status === 200 && /^provider_model,calls,/.test(modelsCsv.body);
  console.log(`  ${modelsOk ? 'PASS' : 'FAIL'} models 导出表头`);
  if (!modelsOk) smokeFailures += 1;

  // 自然月 / 季度 / 年：宽 scope 应回落到本地日志口径（官方接口只有 30 天）
  const yearJson = await callExport('/token-cost/export?dataset=daily&scope=year&format=json');
  const yearParsed = JSON.parse(yearJson.body);
  const yearOk = yearJson.status === 200 && yearParsed.scope === 'year' && yearParsed.source === 'local'
    && Array.isArray(yearParsed.rows);
  console.log(`  ${yearOk ? 'PASS' : 'FAIL'} 自然年导出 source=${yearParsed.source} rows=${yearParsed.rows?.length}`);
  if (!yearOk) smokeFailures += 1;

  const quarterCsv = await callExport('/token-cost/export?dataset=daily&scope=quarter&format=csv');
  const quarterOk = quarterCsv.status === 200 && /^date,cny,/.test(quarterCsv.body)
    && /filename="dsh-token-cost-daily-quarter-/.test(quarterCsv.headers['content-disposition'] ?? '');
  console.log(`  ${quarterOk ? 'PASS' : 'FAIL'} 自然季度 CSV 下载头`);
  if (!quarterOk) smokeFailures += 1;

  // 面板内改预算：POST /settings 写插件本机配置文件（当前 DSH 没有 settings.register，
  // 写 DSH 设置这条路走不通；这里验证文件落盘 + 新实例（模拟重启）能读到）。
  const settingsRoute = routes.find((r) => r.path.endsWith('/settings'));
  let postBody = '', postStatus = 0;
  const req = {
    method: 'POST',
    on(event, cb) {
      if (event === 'data') cb(JSON.stringify({ monthlyBudget: 300, dailyBudget: 60 }));
      if (event === 'end') cb();
      return this;
    },
  };
  await settingsRoute.handler(req, { writeHead: (s) => { postStatus = s; }, end: (b) => { postBody = b; } });
  let saved = null;
  try { saved = JSON.parse(readFileSync(SMOKE_SETTINGS, 'utf8')); } catch { saved = null; }
  const postOk = postStatus === 200 && JSON.parse(postBody)?.ok === true
    && saved?.monthlyBudget === 300 && saved?.dailyBudget === 60;
  console.log(`  ${postOk ? 'PASS' : 'FAIL'} 面板内写回预算（本机文件）：${JSON.stringify(saved)}`);
  if (!postOk) smokeFailures += 1;

  // GET 能读回；新实例（重启 DSH）仍按文件里的预算出数
  let getBody = '';
  await settingsRoute.handler({ method: 'GET' }, { writeHead() {}, end: (b) => { getBody = b; } });
  const getOk = JSON.parse(getBody)?.data?.editable?.dailyBudget === 60
    && JSON.parse(getBody)?.data?.editable?.monthlyBudget === 300;
  console.log(`  ${getOk ? 'PASS' : 'FAIL'} 面板读取生效预算：${JSON.stringify(JSON.parse(getBody)?.data?.editable)}`);
  if (!getOk) smokeFailures += 1;
  // 非法输入必须明确报错，不能把负数写进配置
  let badStatus = 0, badBody = '';
  const badReq = {
    method: 'POST',
    on(event, cb) {
      if (event === 'data') cb(JSON.stringify({ dailyBudget: -1 }));
      if (event === 'end') cb();
      return this;
    },
  };
  await settingsRoute.handler(badReq, { writeHead: (s) => { badStatus = s; }, end: (b) => { badBody = b; } });
  const badBudgetOk = badStatus === 400 && JSON.parse(badBody)?.ok === false;
  console.log(`  ${badBudgetOk ? 'PASS' : 'FAIL'} 非法预算被拒：${badStatus} ${JSON.parse(badBody)?.error}`);
  if (!badBudgetOk) smokeFailures += 1;
  // 告警线 0 是合法值，不能被 || 80 吞掉
  const zeroReq = {
    method: 'POST',
    on(event, cb) {
      if (event === 'data') cb(JSON.stringify({ alertAtPercent: 0 }));
      if (event === 'end') cb();
      return this;
    },
  };
  await settingsRoute.handler(zeroReq, { writeHead() {}, end() {} });
  let zeroBody = '';
  await settingsRoute.handler({ method: 'GET' }, { writeHead() {}, end: (b) => { zeroBody = b; } });
  const zeroOk = JSON.parse(zeroBody)?.data?.editable?.alertAtPercent === 0;
  console.log(`  ${zeroOk ? 'PASS' : 'FAIL'} 告警线 0 被保留：alertAtPercent=${JSON.parse(zeroBody)?.data?.editable?.alertAtPercent}`);
  if (!zeroOk) smokeFailures += 1;
  {
    const { ctx: ctxS, routes: rS } = newCtx();
    await mod.apply(ctxS, { sessionsRoot: join(tmpdir(), `dsh-token-cost-empty-${process.pid}`), settingsPath: SMOKE_SETTINGS });
    const got = await callRoute(rS, '/summary', '/token-cost/summary?refresh=1');
    const cfgOk = got.payload?.config?.dailyBudget === 60 && got.payload?.config?.monthlyBudget === 300
      && got.payload?.config?.alertAtPercent === 0;
    console.log(`  ${cfgOk ? 'PASS' : 'FAIL'} 重启后预算/告警线仍生效：daily=${got.payload?.config?.dailyBudget} monthly=${got.payload?.config?.monthlyBudget} alert=${got.payload?.config?.alertAtPercent}`);
    if (!cfgOk) smokeFailures += 1;
  }
  rmSync(SMOKE_SETTINGS, { force: true });

  // 写失败路径：设置文件的父路径是普通文件（mkdir/rename 必失败）→ 400，且不能"内存里生效"
  {
    const blocked = join(tmpdir(), `dsh-token-cost-blocked-${process.pid}`);
    writeFileSync(blocked, 'x');
    try {
      const { ctx: ctxF, routes: rF } = newCtx();
      await mod.apply(ctxF, { sessionsRoot: join(tmpdir(), `dsh-token-cost-empty-${process.pid}`), settingsPath: join(blocked, 'settings.json') });
      const routeF = rF.find((r) => r.path.endsWith('/settings'));
      let failStatus = 0, failBody = '';
      const failReq = {
        method: 'POST',
        on(event, cb) {
          if (event === 'data') cb(JSON.stringify({ dailyBudget: 99 }));
          if (event === 'end') cb();
          return this;
        },
      };
      await routeF.handler(failReq, { writeHead: (s) => { failStatus = s; }, end: (b) => { failBody = b; } });
      let afterBody = '';
      await routeF.handler({ method: 'GET' }, { writeHead() {}, end: (b) => { afterBody = b; } });
      const failOk = failStatus === 400 && JSON.parse(failBody)?.ok === false
        && JSON.parse(afterBody)?.data?.editable?.dailyBudget === 0;
      console.log(`  ${failOk ? 'PASS' : 'FAIL'} 设置写失败 → 400 且不生效：status=${failStatus} editable.dailyBudget=${JSON.parse(afterBody)?.data?.editable?.dailyBudget}`);
      if (!failOk) smokeFailures += 1;
    } finally {
      rmSync(blocked, { force: true });
    }
  }
}

// 卸载：disposer 应把路由摘干净
for (const e of effects) e.dispose?.();
console.log(`\nafter dispose: routes=${routes.length} (expect 0)`);
  // ---- 官方用量：账号会话（x-dsh-auth-token，免网页登录）----
  {
    console.log('\n-- 官方用量（账号会话，免登录） --');
    const realFetch = globalThis.fetch;
    const hits = [];
    // 造「今天」的官方数据：日窗口按天、当天窗口按小时（与平台接口的桶粒度一致）。
    // 今日 9 点花了 0.5、10 点花了 4.52 → 分时花费应直接采用官方金额（不是本地估算）。
    const TZ = 8 * 3600;
    const nowMs = Date.now();
    const dayStartSec = Math.floor((nowMs + TZ * 1000) / 86400000) * 86400 - TZ;
    const usage = { PROMPT_CACHE_HIT_TOKEN: 1e6, PROMPT_CACHE_MISS_TOKEN: 1e6, RESPONSE_TOKEN: 1e6, REQUEST: 1 };
    globalThis.fetch = async (url, init) => {
      const target = String(url);
      if (!target.includes('/api/v0/usage/by_api_key/')) throw new Error(`unexpected fetch: ${target}`);
      hits.push(init?.headers?.['x-dsh-auth-token']);
      const params = new URL(target).searchParams;
      const todayWindow = Number(params.get('start')) + 86400 >= Number(params.get('end'));
      const isCost = target.includes('/cost?');
      let bizData;
      if (!isCost) {
        // amount 接口的桶在 biz_data.series（cost 接口在 biz_data.data[].series）—— 与宿主解析保持一致
        bizData = todayWindow
          ? { start: 0, end: 0, bucket: 3600, models: ['deepseek-flash'], series: [{ buckets: [{ time: dayStartSec + 10 * 3600, usage }] }], data: [{ currency: 'CNY', series: [] }] }
          : { start: 0, end: 0, bucket: 86400, models: ['deepseek-flash'], series: [{ buckets: [{ time: dayStartSec, usage }] }], data: [{ currency: 'CNY', series: [] }] };
      } else {
        bizData = todayWindow
          ? { start: 0, end: 0, bucket: 3600, models: ['deepseek-flash'], series: [], data: [{ currency: 'CNY', series: [{ buckets: [{ time: dayStartSec + 9 * 3600, cost: 0.5 }, { time: dayStartSec + 10 * 3600, cost: 4.52 }] }] }] }
          : { start: 0, end: 0, bucket: 86400, models: ['deepseek-flash'], series: [], data: [{ currency: 'CNY', series: [{ buckets: [{ time: dayStartSec, cost: 5.02 }] }] }] };
      }
      return { ok: true, status: 200, json: async () => ({ code: 0, data: { biz_code: 0, biz_data: bizData } }) };
    };
    const fmtY = (v) => Number(v ?? 0).toFixed(2);
    // 会话目录里放三条调用，分别验证三条渠道的合并：
    //  3 点 pi-ai（第三方，GLM 1M miss = ¥8）
    //  4 点 deepseek-official（API Key，1M miss 空闲档 = ¥1 → 用 8M 让它等于 ¥8）
    //  2 点 deepseek-account（本机账号日志，官方接口已覆盖 → 绝不能再加一遍）
    const root = join(tmpdir(), `dsh-token-cost-official-${process.pid}`);
    const sessionDir = join(root, 'ws-official', 'sess-official');
    mkdirSync(sessionDir, { recursive: true });
    const mkCall = (hour, provider, model, inputTokens) => ({
      type: 'assistant/message', time: dayStartSec * 1000 + hour * 3600e3 + 60e3,
      data: {
        usage: { inputTokens, cacheReadTokens: 0, outputTokens: 0 },
        message: { source: { provider, model } },
      },
    });
    writeFileSync(join(sessionDir, 'session.jsonl'), [
      { type: 'session', id: 'sess-official', createdAt: dayStartSec * 1000 + 3600e3, delegationDepth: 0 },
      mkCall(2, 'deepseek-account', 'deepseek-flash', 1_000_000),
      mkCall(3, 'pi-ai', 'glm-5.3', 1_000_000),
      mkCall(4, 'deepseek-official', 'deepseek-flash', 8_000_000),
    ].map((r) => JSON.stringify(r)).join('\n'));
    try {
      const { ctx: ctxG, routes: rG } = newCtx({
        settings: { officialOnly: false },
        account: {
          async getBalance() { return { status: 'ready', value: [{ currency: 'CNY', balance: '5' }], bonusWallets: [] }; },
          async getPlatformSession() { return { origin: 'https://platform.deepseek.com', token: 'acct-session-token', requestHeaders: {} }; },
        },
      });
      await mod.apply(ctxG, { sessionsRoot: root });
      await new Promise((r) => setTimeout(r, 60));
      await callRoute(rG, '/summary', '/token-cost/summary?refresh=1');
      await new Promise((r) => setTimeout(r, 300));
      const got = await callRoute(rG, '/summary', '/token-cost/summary');
      const off = got.payload?.official ?? {};
      const ok = off.ok === true && off.auth === 'account' && hits.length > 0 && hits.every((h) => h === 'acct-session-token');
      console.log(`  ${ok ? 'PASS' : 'FAIL'} official.ok=${off.ok} auth=${off.auth} reason=${off.reason ?? '-'} 请求数=${hits.length}`);
      if (!ok) smokeFailures += 1;
      // 分时花费按渠道合并：官方账号按小时金额（9 点 0.5 + 10 点 4.52）
      // + 本机 API Key（4 点 ¥8）+ 本机第三方（3 点 ¥8）。
      // 2 点的 deepseek-account 本机日志必须被官方覆盖、不能重复加。
      const today = got.payload?.days?.[got.payload?.today];
      const hourCny = today?.byHourCny ?? [];
      const hourSum = hourCny.reduce((a, v) => a + v, 0);
      const channels = got.payload?.dayChannels ?? {};
      const adoptOk = Array.isArray(off.byHourCny)
        && Math.abs((hourCny[9] ?? 0) - 0.5) < 1e-6
        && Math.abs((hourCny[10] ?? 0) - 4.52) < 1e-6
        && Math.abs((hourCny[3] ?? 0) - 8) < 0.01
        && Math.abs((hourCny[4] ?? 0) - 8) < 0.01
        && Math.abs(hourCny[2] ?? 0) < 1e-9
        && Math.abs((today?.cny ?? 0) - 21.02) < 0.01
        && Math.abs(hourSum - (today?.cny ?? 0)) < 0.01
        && Math.abs((channels.account?.cny ?? 0) - 5.02) < 1e-6
        && Math.abs((channels.apiKey?.cny ?? 0) - 8) < 0.01
        && Math.abs((channels.third?.cny ?? 0) - 8) < 0.01;
      console.log(`  ${adoptOk ? 'PASS' : 'FAIL'} 三渠道合并：账号(官方)=¥${fmtY(channels.account?.cny)} APIKey(本机)=¥${fmtY(channels.apiKey?.cny)} 第三方=¥${fmtY(channels.third?.cny)} 当日=¥${fmtY(today?.cny)}；分时 9点=¥${fmtY(hourCny[9])} 10点=¥${fmtY(hourCny[10])} 3点=¥${fmtY(hourCny[3])} 4点=¥${fmtY(hourCny[4])} 2点(应忽略)=¥${fmtY(hourCny[2])} 合计=¥${fmtY(hourSum)}`);
      if (!adoptOk) smokeFailures += 1;
    } catch (error) {
      console.log(`  FAIL 官方用量（账号会话）：${error?.message ?? error}`);
      smokeFailures += 1;
    } finally {
      globalThis.fetch = realFetch;
      rmSync(root, { recursive: true, force: true });
    }
  }

  // ---- 官方分时花费：当天窗口若按天返回（多个 series 各一个日桶），必须拒绝 ----
  {
    console.log('\n-- 官方分时花费：按天桶必须拒绝 --');
    const realFetch = globalThis.fetch;
    const TZ = 8 * 3600;
    const nowMs = Date.now();
    const dayStartSec = Math.floor((nowMs + TZ * 1000) / 86400000) * 86400 - TZ;
    const usage = { PROMPT_CACHE_HIT_TOKEN: 1e6, PROMPT_CACHE_MISS_TOKEN: 1e6, RESPONSE_TOKEN: 1e6, REQUEST: 1 };
    globalThis.fetch = async (url) => {
      const target = String(url);
      if (!target.includes('/api/v0/usage/by_api_key/')) throw new Error(`unexpected fetch: ${target}`);
      const params = new URL(target).searchParams;
      const todayWindow = Number(params.get('start')) + 86400 >= Number(params.get('end'));
      const isCost = target.includes('/cost?');
      let bizData;
      if (!isCost) {
        bizData = todayWindow
          ? { start: 0, end: 0, bucket: 3600, models: [], series: [{ buckets: [{ time: dayStartSec + 10 * 3600, usage }] }], data: [{ currency: 'CNY', series: [] }] }
          : { start: 0, end: 0, bucket: 86400, models: [], series: [{ buckets: [{ time: dayStartSec, usage }] }], data: [{ currency: 'CNY', series: [] }] };
      } else {
        // 当天窗口退回按天桶：两个 series 各一个 0 点桶（旧实现按「桶数 ≥2」会误判成按小时）
        bizData = todayWindow
          ? {
            start: 0, end: 0, bucket: 86400, models: [], series: [], data: [
              { currency: 'CNY', series: [{ buckets: [{ time: dayStartSec, cost: 2.5 }] }] },
              { currency: 'CNY', series: [{ buckets: [{ time: dayStartSec, cost: 2.52 }] }] },
            ],
          }
          : { start: 0, end: 0, bucket: 86400, models: [], series: [], data: [{ currency: 'CNY', series: [{ buckets: [{ time: dayStartSec, cost: 5.02 }] }] }] };
      }
      return { ok: true, status: 200, json: async () => ({ code: 0, data: { biz_code: 0, biz_data: bizData } }) };
    };
    const root = join(tmpdir(), `dsh-token-cost-daily-bucket-${process.pid}`);
    mkdirSync(root, { recursive: true });
    try {
      const { ctx: ctxG, routes: rG } = newCtx({
        account: {
          async getBalance() { return { status: 'ready', value: [{ currency: 'CNY', balance: '5' }], bonusWallets: [] }; },
          async getPlatformSession() { return { origin: 'https://platform.deepseek.com', token: 'acct-session-token', requestHeaders: {} }; },
        },
      });
      await mod.apply(ctxG, { sessionsRoot: root });
      await new Promise((r) => setTimeout(r, 60));
      await callRoute(rG, '/summary', '/token-cost/summary?refresh=1');
      await new Promise((r) => setTimeout(r, 300));
      const got = await callRoute(rG, '/summary', '/token-cost/summary');
      const off = got.payload?.official ?? {};
      const today = got.payload?.days?.[got.payload?.today];
      const hourCny = today?.byHourCny ?? [];
      const hourSum = hourCny.reduce((a, v) => a + v, 0);
      // 拒绝后回退：按合并后的分时 token 占比分摊（mock 的 token 都在 10 点）
      const rejectOk = off.ok === true && off.byHourCny === null
        && Math.abs(hourCny[0] ?? 0) < 1e-9
        && Math.abs((hourCny[10] ?? 0) - 5.02) < 0.01
        && Math.abs(hourSum - (today?.cny ?? 0)) < 0.01;
      console.log(`  ${rejectOk ? 'PASS' : 'FAIL'} 按天桶被拒（official.byHourCny=${JSON.stringify(off.byHourCny)}），回退按 token 占比：0点=¥${(hourCny[0] ?? 0).toFixed(2)} 10点=¥${(hourCny[10] ?? 0).toFixed(2)} 合计=¥${hourSum.toFixed(2)}`);
      if (!rejectOk) smokeFailures += 1;
    } catch (error) {
      console.log(`  FAIL 官方分时花费（按天桶）：${error?.message ?? error}`);
      smokeFailures += 1;
    } finally {
      globalThis.fetch = realFetch;
      rmSync(root, { recursive: true, force: true });
    }
  }

  // ---- 官方分时花费：bucket 字段缺失时，多小时桶仍可采用（兜底启发式）----
  {
    console.log('\n-- 官方分时花费：缺 bucket 字段的兜底 --');
    const realFetch = globalThis.fetch;
    const TZ = 8 * 3600;
    const nowMs = Date.now();
    const dayStartSec = Math.floor((nowMs + TZ * 1000) / 86400000) * 86400 - TZ;
    const usage = { PROMPT_CACHE_HIT_TOKEN: 1e6, PROMPT_CACHE_MISS_TOKEN: 1e6, RESPONSE_TOKEN: 1e6, REQUEST: 1 };
    globalThis.fetch = async (url) => {
      const target = String(url);
      const params = new URL(target).searchParams;
      const todayWindow = Number(params.get('start')) + 86400 >= Number(params.get('end'));
      const isCost = target.includes('/cost?');
      // 故意不写 bucket 字段：线上接口若少字段，应退回「≥2 个不同小时」的启发式而不是永远不采用
      let bizData;
      if (!isCost) {
        bizData = todayWindow
          ? { start: 0, end: 0, models: [], series: [{ buckets: [{ time: dayStartSec + 10 * 3600, usage }] }], data: [{ currency: 'CNY', series: [] }] }
          : { start: 0, end: 0, models: [], series: [{ buckets: [{ time: dayStartSec, usage }] }], data: [{ currency: 'CNY', series: [] }] };
      } else {
        bizData = todayWindow
          ? { start: 0, end: 0, models: [], series: [], data: [{ currency: 'CNY', series: [{ buckets: [{ time: dayStartSec + 9 * 3600, cost: 0.5 }, { time: dayStartSec + 10 * 3600, cost: 4.52 }] }] }] }
          : { start: 0, end: 0, models: [], series: [], data: [{ currency: 'CNY', series: [{ buckets: [{ time: dayStartSec, cost: 5.02 }] }] }] };
      }
      return { ok: true, status: 200, json: async () => ({ code: 0, data: { biz_code: 0, biz_data: bizData } }) };
    };
    const root = join(tmpdir(), `dsh-token-cost-no-bucket-${process.pid}`);
    mkdirSync(root, { recursive: true });
    try {
      const { ctx: ctxN, routes: rN } = newCtx({
        account: {
          async getBalance() { return { status: 'ready', value: [{ currency: 'CNY', balance: '5' }], bonusWallets: [] }; },
          async getPlatformSession() { return { origin: 'https://platform.deepseek.com', token: 'acct-session-token', requestHeaders: {} }; },
        },
      });
      await mod.apply(ctxN, { sessionsRoot: root });
      await new Promise((r) => setTimeout(r, 60));
      await callRoute(rN, '/summary', '/token-cost/summary?refresh=1');
      await new Promise((r) => setTimeout(r, 300));
      const got = await callRoute(rN, '/summary', '/token-cost/summary');
      const today = got.payload?.days?.[got.payload?.today];
      const hourCny = today?.byHourCny ?? [];
      const adoptOk = Array.isArray(got.payload?.official?.byHourCny)
        && Math.abs((hourCny[9] ?? 0) - 0.5) < 1e-6
        && Math.abs((hourCny[10] ?? 0) - 4.52) < 1e-6;
      console.log(`  ${adoptOk ? 'PASS' : 'FAIL'} 缺 bucket 字段仍按多小时采用：9点=¥${(hourCny[9] ?? 0).toFixed(2)} 10点=¥${(hourCny[10] ?? 0).toFixed(2)}`);
      if (!adoptOk) smokeFailures += 1;
    } catch (error) {
      console.log(`  FAIL 官方分时花费（缺 bucket 字段）：${error?.message ?? error}`);
      smokeFailures += 1;
    } finally {
      globalThis.fetch = realFetch;
      rmSync(root, { recursive: true, force: true });
    }
  }

// ---- 混合口径：官方 DeepSeek 用量 + 本地 GLM 第三方用量 ----
{
  console.log('\n-- 混合口径（官方 + GLM 第三方） --');
  const root = join(tmpdir(), `dsh-token-cost-mixed-${process.pid}`);
  const sessionDir = join(root, 'ws-mixed', 'sess-mixed');
  mkdirSync(sessionDir, { recursive: true });
  const now = Date.now();
  const records = [
    { type: 'session', id: 'sess-mixed', createdAt: now - 60_000, delegationDepth: 0 },
    {
      type: 'assistant/message', time: now - 30_000,
      data: {
        usage: { inputTokens: 1_000_000, cacheReadTokens: 0, outputTokens: 0 },
        message: { source: { provider: 'deepseek-account', model: 'deepseek-flash' } },
      },
    },
    {
      type: 'assistant/message', time: now - 20_000,
      data: {
        usage: { inputTokens: 1_000_000, cacheReadTokens: 0, outputTokens: 0 },
        message: { source: { provider: 'pi-ai', model: 'glm-5.3' } },
      },
    },
  ];
  writeFileSync(join(sessionDir, 'session.jsonl'), records.map((r) => JSON.stringify(r)).join('\n'));
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const target = String(url);
    if (target.includes('/api/v0/usage/by_api_key/')) {
      return { ok: true, status: 200, json: async () => ({ code: 0, data: { biz_code: 0, biz_data: { start: 0, end: 0, bucket: 86400, models: [], series: [], data: [{ currency: 'CNY', series: [] }] } } }) };
    }
    if (target.includes('/api/v0/users/get_user_summary')) return { ok: true, status: 200, json: async () => ({ data: { biz_data: { total_costs: [] } } }) };
    throw new Error(`unexpected fetch: ${target}`);
  };
  try {
    const { ctx: ctxM, routes: rM } = newCtx({
      settings: { officialOnly: false, historyDays: 365, scanBudgetMs: 0 },
      account: {
        async getBalance() { return { status: 'ready', value: [{ currency: 'CNY', balance: '5' }], bonusWallets: [] }; },
        async getPlatformSession() { return { origin: 'https://platform.deepseek.com', token: 'acct-session-token', requestHeaders: {} }; },
      },
    });
    await mod.apply(ctxM, { sessionsRoot: root });
    await new Promise((resolve) => setTimeout(resolve, 80));
    const got = await callRoute(rM, '/summary', '/token-cost/summary?refresh=1');
    const data = got.payload;
    const today = data?.days?.[data.today];
    const ok = data?.meterSource === 'mixed'
      && today && Math.abs(today.cny - 8) < 1e-6
      && Math.abs((data.providers?.['pi-ai']?.cny ?? 0) - 8) < 1e-6;
    console.log(`  ${ok ? 'PASS' : 'FAIL'} meterSource=${data?.meterSource} todayCny=${today?.cny} pi-ai=¥${data?.providers?.['pi-ai']?.cny}（官方 0 + GLM 8）`);
    if (!ok) smokeFailures += 1;
    // 官方没给按小时金额时，分时花费按本地估算，并归一到合并后的当日金额
    const hourSum = (today?.byHourCny ?? []).reduce((a, v) => a + v, 0);
    const hourOk = today && Math.abs(hourSum - today.cny) < 0.01;
    console.log(`  ${hourOk ? 'PASS' : 'FAIL'} 分时花费回落本地估算并归一到当日金额：合计=¥${hourSum.toFixed(2)} 当日=¥${(today?.cny ?? 0).toFixed(2)}`);
    if (!hourOk) smokeFailures += 1;
  } catch (error) {
    console.log(`  FAIL 混合口径：${error?.message ?? error}`);
    smokeFailures += 1;
  } finally {
    globalThis.fetch = realFetch;
    rmSync(root, { recursive: true, force: true });
  }
}

console.log(smokeFailures === 0 ? 'HOST SMOKE OK' : `HOST SMOKE FAILED (${smokeFailures})`);
if (smokeFailures > 0) process.exit(1);
