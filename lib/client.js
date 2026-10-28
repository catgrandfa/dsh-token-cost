window.__ModuleLoader__.load({ id: "dsh-token-cost", factory: (require) => {
var module = { exports: {} }; var exports = module.exports;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.js
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);
var import_react = __toESM(require("react"), 1);
var PKG_NAME = true ? "dsh-token-cost" : "dsh-token-cost";
var SHORT_NAME = PKG_NAME.replace(/^dsh-/, "");
var SLOT_ID = SHORT_NAME.replace(/-/g, "");
var ROUTE_BASE = `/${SHORT_NAME}`;
var LOCALE_NS = SHORT_NAME;
var ROUTE = `${ROUTE_BASE}/summary`;
var zh = {
  "nav": "Token \u82B1\u8D39",
  "title": "Token \u82B1\u8D39",
  "subtitle": "DeepSeek \xB7 \u672C\u673A\u4F30\u7B97",
  "today": "\u4ECA\u65E5\u6D88\u8D39",
  "peak": "\u9AD8\u5CF0\u65F6\u6BB5\u8BA1\u4EF7",
  "offpeak": "\u7A7A\u95F2\u6863 \xB7 \u534A\u4EF7",
  "vsPrev": "vs \u4E0A\u6B21\u4F7F\u7528",
  "budgetUsed": "\u9884\u7B97",
  "used": "\u5DF2\u7528",
  "remain": "\u5269\u4F59",
  "balance": "\u8D26\u6237\u4F59\u989D",
  "checkBalance": "\u67E5\u8BE2\u4F59\u989D",
  "balanceLoading": "\u67E5\u8BE2\u4E2D\u2026",
  "balanceAccount": "\u8D26\u53F7",
  "balanceApiKey": "API Key",
  "inclGranted": "\u542B\u8D60\u9001",
  "peakHourLabel": "\u5CF0\u503C",
  "peakShort": "\u9AD8\u5CF0",
  "offShort": "\u7A7A\u95F2",
  "currentTier": "\u5F53\u524D\u65F6\u6BB5",
  "officialLabel": "\u5B98\u65B9",
  "localShort": "\u672C\u5730\u65E5\u5FD7",
  "yesterdayLabel": "\u6628\u5929",
  "historyTitle": "\u5386\u53F2\uFF08\u6309\u5929\uFF09",
  "autoSession": "\u6D4F\u89C8\u5668\u767B\u5F55\u6001",
  "notConnected": "\u672A\u8FDE\u63A5\uFF08\u53EF\u9009\uFF09",
  "totalSpent": "\u7D2F\u8BA1\u6D88\u8D39",
  "lowBalance": "\u4F59\u989D\u504F\u4F4E\uFF0C\u4F4E\u4E8E",
  "lowBalanceHint": "\u70B9\u51FB\u76F4\u63A5\u6539\uFF08\u5199\u56DE DSH \u8BBE\u7F6E\uFF09\uFF0C0 = \u5173\u95ED\u63D0\u9192",
  "editBudgetHint": "\u70B9\u51FB\u76F4\u63A5\u6539\u6BCF\u65E5\u9884\u7B97\uFF08\u5199\u56DE DSH \u8BBE\u7F6E\uFF09",
  "editLowHint": "\u70B9\u51FB\u4FEE\u6539",
  "save": "\u4FDD\u5B58",
  "cancel": "\u53D6\u6D88",
  "rechargeHint": "\u5EFA\u8BAE\u5145\u503C",
  "windowToday": "\u4ECA\u65E5",
  "window7": "\u8FD1 7 \u5929",
  "window30": "\u8FD1 30 \u5929",
  "windowMonth": "\u672C\u6708",
  "authAccount": "\u8D26\u53F7\u767B\u5F55\u6001",
  "authBrowser": "\u6D4F\u89C8\u5668\u767B\u5F55\u6001",
  "timesShort": "\u6B21",
  "totalTokens": "\u603B token",
  "perCall": "\u5355\u6B21\u82B1\u8D39",
  "perCallHint": "\u4ECA\u65E5\u6D88\u8D39 \xF7 \u8C03\u7528\u6B21\u6570\uFF0C\u5355\u4F4D\uFF1A\u5143/\u6B21",
  "composeTitle": "\u603B token \u6784\u6210",
  "colItem": "\u9879\u76EE",
  "colPrice": "\u5355\u4EF7 \u73B0/\u5CF0",
  "colUsage": "\u7528\u91CF",
  "colSubtotal": "\u5C0F\u8BA1",
  "todayTotal": "\u4ECA\u65E5\u5408\u8BA1",
  "tierOffShort": "\u7A7A\u95F2\u6863",
  "byLocalTier": "\u672C\u673A\u65E5\u5FD7\u5206\u6863\uFF08\u53E3\u5F84\u540C\u672C\u5730\u626B\u63CF\uFF09",
  "tierPeakShort": "\u9AD8\u5CF0\u6863",
  "rateFootnote": "\u5355\u4EF7\uFF1A\u5143/\u767E\u4E07 token\uFF08\u6309 flash \u6863\u5C55\u793A\uFF09\u3002\u884C\u5C0F\u8BA1 = \u5B98\u65B9\u7528\u91CF \xD7 \u5F53\u524D\u6863\u5355\u4EF7\uFF0C\u56DB\u820D\u4E94\u5165\u5230\u5206\uFF0C\u4E0E\u5B98\u65B9\u8D26\u5355\u5141\u8BB8\u51E0\u5206\u5DEE\u5F02\u3002",
  "totalSpentHint": "\u8D26\u53F7\u5F00\u901A\u4EE5\u6765\u7684\u5B98\u65B9\u7D2F\u8BA1\u6D88\u8D39\uFF08\u8D70\u8D26\u53F7\u6388\u6743\uFF0C\u4E0D\u9700\u8981\u7F51\u9875\u767B\u5F55\uFF09",
  "notConnectedChrome": "\u672A\u8FDE\u63A5 \xB7 \u9700\u767B\u5F55 platform.deepseek.com",
  "noBrowser": "\u672A\u68C0\u6D4B\u5230 Chrome/Edge\uFF08\u53EF\u9009\uFF09",
  "officialLoading": "\u6B63\u5728\u83B7\u53D6\u5B98\u65B9\u6570\u636E\u2026",
  "firstLoad": "\u9996\u6B21\u52A0\u8F7D\uFF0C\u8BF7\u7A0D\u7B49",
  "firstLoadHint": "\uFF08\u8981\u8BFB\u6D4F\u89C8\u5668\u767B\u5F55\u6001\u5E76\u626B\u63CF\u672C\u673A\u4F1A\u8BDD\u65E5\u5FD7\uFF0C\u901A\u5E38\u51E0\u79D2\uFF09",
  "sumLabel": "\u5408\u8BA1",
  "fromOfficial": "\u5B98\u65B9",
  "tierFromLocal": "\u5CF0/\u8C37\u6309\u672C\u673A\u65E5\u5FD7\u5206\u6863",
  "byCurrentTier": "\u6309\u5F53\u524D\u65F6\u6BB5\u5355\u4EF7",
  "licenseLabel": "\u5F00\u6E90\u534F\u8BAE",
  "updateAvailable": "\u6709\u65B0\u7248\u672C",
  "updateAuto": "\u540E\u53F0\u81EA\u52A8\u66F4\u65B0\u4E2D\uFF08\u91CD\u542F DSH \u751F\u6548\uFF09",
  "updateRunning": "\u6B63\u5728\u540E\u53F0\u66F4\u65B0\u2026",
  "updateApplied": "\u5DF2\u540E\u53F0\u66F4\u65B0\u5B8C\u6210\uFF0C\u91CD\u542F DSH \u751F\u6548",
  "updateFailed": "\u540E\u53F0\u66F4\u65B0\u5931\u8D25\uFF08\u7F3A pnpm\uFF1F\uFF09",
  "copyCmd": "\u590D\u5236\u66F4\u65B0\u547D\u4EE4",
  "copied": "\u5DF2\u590D\u5236 \u2713",
  "viewRelease": "\u53D1\u5E03\u8BF4\u660E",
  "connectOfficial": "\u8FDE\u63A5",
  "connectHint": "\u5B98\u65B9\u7528\u91CF\u662F\u53EF\u9009\u7684\u5BF9\u8D26\u6570\u636E\uFF1A\u5728 Chrome/Edge \u6216 DSH \u5185\u7F6E\u6D4F\u89C8\u5668\u91CC\u767B\u5F55 platform.deepseek.com \u540E\u81EA\u52A8\u8BFB\u53D6\uFF08Safari/Firefox \u8BFB\u4E0D\u5230\uFF0CmacOS \u6C99\u76D2\u9650\u5236\uFF09\u3002\u4F59\u989D\u4E0E\u672C\u5730\u82B1\u8D39\u4E0D\u9700\u8981\u5B83",
  "localEstimate": "\u672C\u5730\u63A8\u7B97",
  "diffLabel": "\u5DEE",
  "officialOff": "\u5B98\u65B9\u7528\u91CF\u5DF2\u5173\u95ED",
  "officialNoToken": "\u672A\u914D\u7F6E Platform userToken",
  "billingLink": "\u5B98\u65B9\u8D26\u5355\u9875",
  "tierTitle": "\u5CF0\u8C37\u4EF7",
  "peakWindow": "\u9AD8\u5CF0\uFF1A\u5468\u4E00\u81F3\u5468\u4E94 9:00-12:00\u300114:00-18:00\uFF08\u5317\u4EAC\u65F6\u95F4\uFF09",
  "rangeCustom": "\u81EA\u5B9A\u4E49",
  "unitPrices": "\u8BA1\u8D39\u5355\u4EF7\uFF08\u5143/\u767E\u4E07 token\uFF09",
  "warnLine": "\u544A\u8B66\u7EBF",
  "rateDetail": "\u8BA1\u8D39\u660E\u7EC6",
  "vsPrevOn": "\u8F83",
  "notEnabled": "\u672A\u5F00\u542F",
  "balanceFailed": "\u67E5\u8BE2\u5931\u8D25",
  "fewDays": "\u66F4\u65E9\u6CA1\u6709\u8BB0\u5F55",
  "showAllSessions": "\u67E5\u770B\u5168\u90E8",
  "collapseSessions": "\u6536\u8D77",
  "missInput": "\u672A\u547D\u4E2D\u8F93\u5165",
  "hitInput": "\u7F13\u5B58\u547D\u4E2D\u8F93\u5165",
  "output": "\u8F93\u51FA",
  "hitRate": "\u7F13\u5B58\u547D\u4E2D\u7387",
  "calls": "\u6B21\u8C03\u7528",
  "trend": "\u6BCF\u65E5\u6D88\u8D39\u8D8B\u52BF",
  "byHour": "\u4ECA\u65E5\u5206\u65F6\u7528\u91CF",
  "costSplit": "\u4ECA\u65E5\u6210\u672C\u6784\u6210",
  "clickForSplit": "\u70B9\u51FB\u53EF\u770B\u5F53\u5929\u6210\u672C\u6784\u6210",
  "byAmount": "\u6309\u91D1\u989D\u5360\u6BD4",
  "sessions": "\u4ECA\u65E5\u6309\u4F1A\u8BDD\u660E\u7EC6",
  "session": "\u4F1A\u8BDD",
  "lastCall": "\u6700\u8FD1\u8C03\u7528",
  "callsShort": "\u8C03\u7528",
  "cost": "\u6D88\u8D39",
  "share": "\u5360\u6BD4",
  "subagent": "\u5B50\u4EE3\u7406",
  "zeroDays": "\u65E0\u8C03\u7528",
  "noData": "\u8FD8\u6CA1\u6709\u7528\u91CF\u8BB0\u5F55",
  "noDataHint": "\u8FD9\u4E2A\u4F1A\u8BDD\u6216\u672C\u673A\u8FD8\u6CA1\u6709\u4EA7\u751F DeepSeek \u5B98\u65B9\u8BA1\u8D39\u7684\u8C03\u7528\u3002",
  "loading": "\u8BFB\u53D6\u7528\u91CF\u2026",
  "failed": "\u8BFB\u53D6\u5931\u8D25",
  "retry": "\u91CD\u8BD5",
  "refresh": "\u5237\u65B0",
  "auto": "\u81EA\u52A8\u5237\u65B0",
  "live": "\u672C\u4F1A\u8BDD\u5B9E\u65F6",
  "liveHint": "\u6765\u81EA\u5B98\u65B9 tokenUsage \u6295\u5F71\uFF0C\u968F\u5BF9\u8BDD\u5373\u65F6\u66F4\u65B0",
  "overBudget": "\u5DF2\u8D85\u9884\u7B97",
  "peakNow": "\u5F53\u524D\u4E3A\u9AD8\u5CF0\u65F6\u6BB5\uFF08\u53CC\u500D\u4EF7\uFF09",
  "offNow": "\u5F53\u524D\u4E3A\u7A7A\u95F2\u65F6\u6BB5\uFF08\u534A\u4EF7\uFF09",
  "range7": "\u8FD1 7 \u5929",
  "range30": "\u8FD1 30 \u5929",
  "source": "\u6570\u636E\u6E90",
  "updated": "\u66F4\u65B0\u4E8E",
  "partial": "\u5F53\u524D\u4F1A\u8BDD\u4ECD\u5728\u5199\u5165\uFF0C\u4ECA\u65E5\u6570\u5B57\u662F\u4E0B\u754C",
  "scanning": "\u6B63\u5728\u8865\u626B\u5386\u53F2\u2026",
  "rateLine": "\u8BA1\u8D39\u53E3\u5F84"
};
var en = {
  "nav": "Token cost",
  "title": "Token cost",
  "subtitle": "DeepSeek \xB7 local estimate",
  "today": "Spent today",
  "peak": "peak-hour pricing",
  "offpeak": "off-peak \xB7 half price",
  "vsPrev": "vs last use",
  "budgetUsed": "Budget",
  "used": "used",
  "remain": "left",
  "balance": "Balance",
  "checkBalance": "Check balance",
  "balanceLoading": "loading\u2026",
  "balanceAccount": "account",
  "balanceApiKey": "API Key",
  "inclGranted": "incl. bonus",
  "peakHourLabel": "peak",
  "peakShort": "Peak",
  "offShort": "Off-peak",
  "currentTier": "Current period",
  "officialLabel": "Official",
  "localShort": "local log",
  "yesterdayLabel": "yesterday",
  "historyTitle": "History (daily)",
  "autoSession": "browser session",
  "notConnected": "not connected (optional)",
  "totalSpent": "Total spent",
  "lowBalance": "Low balance, below",
  "lowBalanceHint": "Click to edit (writes back to DSH settings); 0 disables",
  "editBudgetHint": "Click to edit the daily budget",
  "editLowHint": "edit",
  "save": "Save",
  "cancel": "Cancel",
  "rechargeHint": "top up",
  "windowToday": "Today",
  "window7": "Last 7d",
  "window30": "Last 30d",
  "windowMonth": "This month",
  "authAccount": "account session",
  "authBrowser": "browser session",
  "timesShort": "calls",
  "totalTokens": "Total tokens",
  "perCall": "Per call",
  "perCallHint": "today's cost \xF7 calls (CNY per call)",
  "composeTitle": "Token mix",
  "colItem": "Item",
  "colPrice": "Price",
  "colUsage": "Usage",
  "colSubtotal": "Subtotal",
  "todayTotal": "Today total",
  "tierOffShort": "Off-peak",
  "byLocalTier": "Local-log tier split",
  "tierPeakShort": "Peak",
  "rateFootnote": "Unit price: CNY per million tokens (flash tier shown). Subtotal = official usage \xD7 current-tier price, rounded to cents; small differences vs the official bill are expected.",
  "totalSpentHint": "official lifetime spend on this account (account grant, no web sign-in needed)",
  "notConnectedChrome": "not connected \xB7 sign in at platform.deepseek.com",
  "noBrowser": "no Chrome/Edge detected (optional)",
  "officialLoading": "fetching official data\u2026",
  "firstLoad": "First load, please wait",
  "firstLoadHint": "(reading browser session and scanning local session logs \u2014 usually a few seconds)",
  "sumLabel": "Total",
  "fromOfficial": "official",
  "tierFromLocal": "peak/off-peak split from local logs",
  "byCurrentTier": "at the current tier price",
  "licenseLabel": "license",
  "updateAvailable": "update available",
  "updateAuto": "auto-updating in background (restart DSH)",
  "updateRunning": "updating in background\u2026",
  "updateApplied": "updated in background \u2014 restart DSH",
  "updateFailed": "background update failed (pnpm missing?)",
  "copyCmd": "copy update command",
  "copied": "copied \u2713",
  "viewRelease": "release notes",
  "connectOfficial": "Connect",
  "connectHint": "Optional cross-check: sign in at platform.deepseek.com in Chrome/Edge \u2014 the session is read automatically (Safari/Firefox unsupported). Balance and local cost do not need it",
  "localEstimate": "local estimate",
  "diffLabel": "diff",
  "officialOff": "Official usage is off",
  "officialNoToken": "Platform userToken not configured",
  "billingLink": "Official billing page",
  "tierTitle": "Peak / off-peak rates",
  "peakWindow": "Peak: Mon-Fri 09:00-12:00, 14:00-18:00 (Beijing time)",
  "rangeCustom": "Custom",
  "unitPrices": "Unit prices (CNY per million tokens)",
  "notEnabled": "off",
  "balanceFailed": "lookup failed",
  "warnLine": "Alert line",
  "rateDetail": "Rate detail",
  "vsPrevOn": "vs",
  "fewDays": "no earlier records",
  "showAllSessions": "Show all",
  "collapseSessions": "Collapse",
  "missInput": "Uncached input",
  "hitInput": "Cached input",
  "output": "Output",
  "hitRate": "Cache hit rate",
  "calls": "calls",
  "trend": "Daily spend",
  "byHour": "Today by hour",
  "costSplit": "Cost breakdown today",
  "clickForSplit": "Click a bar to see that day",
  "byAmount": "share by cost",
  "sessions": "Today by session",
  "session": "Session",
  "lastCall": "Last call",
  "callsShort": "Calls",
  "cost": "Cost",
  "share": "Share",
  "subagent": "subagent",
  "zeroDays": "no calls",
  "noData": "No usage recorded yet",
  "noDataHint": "No DeepSeek-billed calls have been recorded yet.",
  "loading": "Loading usage\u2026",
  "failed": "Failed to load",
  "retry": "Retry",
  "refresh": "Refresh",
  "auto": "Auto refresh",
  "live": "This session",
  "liveHint": "Live from the official tokenUsage projection",
  "overBudget": "over budget",
  "peakNow": "Peak hours now (double price)",
  "offNow": "Off-peak now (half price)",
  "range7": "7 days",
  "range30": "30 days",
  "source": "Source",
  "updated": "Updated",
  "partial": "This session is still appending; today is a lower bound",
  "scanning": "backfilling history\u2026",
  "rateLine": "Pricing"
};
var fmt = (n) => {
  const v = Number(n) || 0;
  if (v >= 1e6) return (v / 1e6).toFixed(v / 1e6 >= 10 ? 1 : 2) + "M";
  if (v >= 1e3) return (v / 1e3).toFixed(v / 1e3 >= 10 ? 0 : 1) + "K";
  return String(Math.round(v));
};
var fmtM = (n) => {
  const v = Number(n) || 0;
  if (v >= 1e7) return (v / 1e6).toFixed(1) + "M";
  if (v >= 1e6) return (v / 1e6).toFixed(2) + "M";
  if (v >= 1e3) return (v / 1e6).toFixed(3) + "M";
  return (v / 1e6).toFixed(4) + "M";
};
var money = (n) => "\xA5" + (Number(n) || 0).toFixed(2);
var pct = (a, b) => b > 0 ? 100 * a / b : 0;
var hhmm = (ms) => {
  if (!ms) return "\u2014";
  const d = new Date(ms + 8 * 36e5);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
};
var clock = (ms) => new Date(ms).toTimeString().slice(0, 8);
function fmtMoney(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value ?? "\u2014");
  if (n === 0) return "0.00";
  const abs = Math.abs(n);
  const digits = abs >= 0.01 ? 2 : abs >= 1e-4 ? 4 : 6;
  return n.toFixed(digits);
}
var C = {
  // 三色（方案 B：青绿 / 琥珀 / 靛蓝）—— 色相 165°/35°/245°，两两间隔 ≥80°，
  // 图例 9px 小色块并排也能一眼分开；绿=命中省钱、琥珀=未命中花钱，语义直觉一致。
  // 浅色主题对应值（#0D9488 / #B45309 / #4F46E5）待接入主题检测后切换。
  hit: "#2DD4BF",
  miss: "#F59E0B",
  out: "#818CF8",
  warn: "var(--dsw-alias-state-warn-primary, #e3b341)",
  error: "var(--dsw-alias-state-error-primary, #f85149)",
  ok: "var(--dsw-alias-state-success-primary, #3fb950)",
  label: "var(--dsw-alias-label-primary, #1f2329)",
  label2: "var(--dsw-alias-label-secondary, #5a6472)",
  label3: "var(--dsw-alias-label-tertiary, #8a94a6)",
  border: "var(--dsw-alias-border-l2, rgba(128,128,128,.25))",
  border1: "var(--dsw-alias-border-l1, rgba(128,128,128,.16))",
  layer1: "var(--dsw-alias-bg-layer-1, rgba(128,128,128,.06))",
  layer2: "var(--dsw-alias-bg-layer-2, rgba(128,128,128,.10))",
  brand: "var(--dsw-alias-brand-primary, #2f7dff)"
};
var card = {
  border: `1px solid ${C.border1}`,
  borderRadius: 12,
  background: C.layer1,
  padding: "12px 13px",
  marginTop: 12
};
var GLASS_BLUR = "blur(22px) saturate(170%)";
var SKINS = {
  default: {
    card: { ...card },
    hero: {
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      padding: "14px 16px",
      background: "var(--dsw-alias-bg-layer-2, rgba(47,125,255,.06))"
    },
    panel: { border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 16px", background: C.layer1 },
    stat: { border: `1px solid ${C.border1}`, borderRadius: 12, background: C.layer1 }
  },
  glass: {
    card: {
      border: "1px solid color-mix(in srgb, var(--dsw-alias-label-primary) 13%, transparent)",
      borderRadius: 16,
      padding: "12px 13px",
      marginTop: 12,
      background: "color-mix(in srgb, var(--dsw-alias-bg-layer-1) 50%, transparent)",
      backdropFilter: GLASS_BLUR,
      WebkitBackdropFilter: GLASS_BLUR,
      boxShadow: "0 10px 32px rgba(0,0,0,.22), inset 0 1px 0 color-mix(in srgb, #fff 20%, transparent)"
    },
    hero: {
      // 与 panel 完全同款：三栏必须同圆角同阴影，否则会"不在一个平面"
      border: "1px solid color-mix(in srgb, var(--dsw-alias-label-primary) 13%, transparent)",
      borderRadius: 16,
      padding: "14px 16px",
      background: "color-mix(in srgb, var(--dsw-alias-bg-layer-1) 50%, transparent)",
      backdropFilter: GLASS_BLUR,
      WebkitBackdropFilter: GLASS_BLUR,
      boxShadow: "0 14px 40px rgba(0,0,0,.24), inset 0 1px 0 color-mix(in srgb, #fff 24%, transparent)"
    },
    panel: {
      border: "1px solid color-mix(in srgb, var(--dsw-alias-label-primary) 13%, transparent)",
      borderRadius: 16,
      padding: "14px 16px",
      background: "color-mix(in srgb, var(--dsw-alias-bg-layer-1) 50%, transparent)",
      backdropFilter: GLASS_BLUR,
      WebkitBackdropFilter: GLASS_BLUR,
      boxShadow: "0 10px 32px rgba(0,0,0,.22), inset 0 1px 0 color-mix(in srgb, #fff 20%, transparent)"
    },
    stat: {
      border: "1px solid color-mix(in srgb, var(--dsw-alias-label-primary) 11%, transparent)",
      borderRadius: 14,
      background: "color-mix(in srgb, var(--dsw-alias-bg-layer-1) 58%, transparent)",
      boxShadow: "inset 0 1px 0 color-mix(in srgb, #fff 16%, transparent)"
    }
  }
};
var skinOf = (name) => SKINS[name] ?? SKINS.default;
if (typeof document !== "undefined" && !document.getElementById("dsh-tm-style")) {
  const el = document.createElement("style");
  el.id = "dsh-tm-style";
  el.textContent = "@keyframes dsh-tm-spin{to{transform:rotate(360deg)}}";
  document.head.appendChild(el);
}
var swatch = (color) => ({
  width: 8,
  height: 8,
  borderRadius: 2,
  background: color,
  display: "inline-block",
  flex: "none"
});
function Stat({ label, value, unit, color, extra, t, surface }) {
  return import_react.default.createElement("div", {
    style: { ...surface ?? { border: `1px solid ${C.border1}`, borderRadius: 12, background: C.layer1 }, padding: "10px 12px", minWidth: 0 }
  }, [
    import_react.default.createElement("div", {
      key: "k",
      style: { display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.label3, whiteSpace: "nowrap" }
    }, [color ? import_react.default.createElement("span", { key: "s", style: swatch(color) }) : null, label]),
    import_react.default.createElement("div", {
      key: "v",
      style: { fontSize: 19, fontWeight: 700, marginTop: 3, color: C.label, fontVariantNumeric: "tabular-nums", overflow: "hidden", textOverflow: "ellipsis" }
    }, [
      value,
      unit ? import_react.default.createElement("span", { key: "u", style: { fontSize: 12, fontWeight: 600, color: C.label3, marginLeft: 1 } }, unit) : null,
      extra ? import_react.default.createElement("span", { key: "e", style: { fontSize: 12, fontWeight: 500, color: C.label3 } }, extra) : null
    ])
  ]);
}
function MiniStat({ label, value, hint }) {
  return import_react.default.createElement("div", {
    title: hint,
    style: {
      border: `1px solid ${C.border1}`,
      borderRadius: 9,
      padding: "7px 9px",
      background: "var(--dsw-alias-bg-layer-1, rgba(128,128,128,.05))"
    }
  }, [
    import_react.default.createElement("div", { key: "t", style: { fontSize: 11, color: C.label3 } }, label),
    import_react.default.createElement("div", {
      key: "v",
      style: { fontSize: 15, fontWeight: 650, fontVariantNumeric: "tabular-nums", marginTop: 1 }
    }, value)
  ]);
}
function LegendDot({ color, text }) {
  return import_react.default.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 } }, [
    import_react.default.createElement("i", { key: "i", style: { width: 8, height: 8, borderRadius: 3, background: color, display: "inline-block" } }),
    import_react.default.createElement("span", { key: "t" }, text)
  ]);
}
function MeterIcon({ size = 16, active }) {
  return import_react.default.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.3,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: { opacity: active ? 1 : 0.82 }
  }, [
    import_react.default.createElement("path", { key: "a", d: "M2.2 12.6a6 6 0 1 1 11.6 0" }),
    import_react.default.createElement("path", { key: "b", d: "M8 10.4 10.6 6.6" }),
    import_react.default.createElement("circle", { key: "c", cx: "8", cy: "11.2", r: "1.2", fill: "currentColor", stroke: "none" })
  ]);
}
var lastSummary = null;
function useSummary(intervalSec) {
  const [state, setState] = import_react.default.useState(() => lastSummary ? { status: "ready", data: lastSummary.data, error: null, at: lastSummary.at } : { status: "loading", data: null, error: null, at: 0 });
  const [tick, setTick] = import_react.default.useState(0);
  const first = import_react.default.useRef(true);
  import_react.default.useEffect(() => {
    let alive = true;
    const force = first.current || lastSummary?.data?.partialScan === true;
    const url = force ? `${ROUTE}?refresh=1` : ROUTE;
    first.current = false;
    fetch(url, { cache: "no-store", credentials: "same-origin" }).then(async (response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = await response.json();
      if (!body?.ok) throw new Error(body?.error ?? "unknown error");
      const at = Date.now();
      lastSummary = { data: body.data, at };
      if (alive) setState({ status: "ready", data: body.data, error: null, at });
    }).catch((error) => {
      if (alive) setState((prev) => ({ ...prev, status: prev.data ? "ready" : "failed", error: String(error?.message ?? error) }));
    });
    return () => {
      alive = false;
    };
  }, [tick]);
  import_react.default.useEffect(() => {
    const sec = Number(intervalSec) > 0 ? Number(intervalSec) : 0;
    if (!sec) return void 0;
    const timer = setInterval(() => setTick((n) => n + 1), sec * 1e3);
    return () => clearInterval(timer);
  }, [intervalSec]);
  const refresh = import_react.default.useCallback(() => setTick((n) => n + 1), []);
  return { ...state, refresh };
}
function useBalance(enabled) {
  const [state, setState] = import_react.default.useState({ status: "idle", data: null });
  const [tick, setTick] = import_react.default.useState(0);
  import_react.default.useEffect(() => {
    if (!enabled) return void 0;
    let alive = true;
    setState((prev) => ({ status: prev.data ? "ready" : "loading", data: prev.data }));
    const locale = typeof navigator !== "undefined" && navigator.language || "zh-CN";
    const url = `${ROUTE_BASE}/balance?locale=${encodeURIComponent(locale)}${tick > 0 ? "&refresh=1" : ""}`;
    fetch(url, { cache: "no-store", credentials: "same-origin" }).then((r) => r.json()).then((body) => {
      if (alive) setState({ status: "ready", data: body?.data ?? null });
    }).catch(() => {
      if (alive) setState({ status: "failed", data: null });
    });
    return () => {
      alive = false;
    };
  }, [enabled, tick]);
  return { ...state, reload: () => setTick((n) => n + 1) };
}
function useLiveUsage(props) {
  const useProjection = props?.useProjection;
  if (typeof useProjection !== "function") return void 0;
  try {
    const value = useProjection("tokenUsage");
    return value && typeof value === "object" ? value : void 0;
  } catch {
    return void 0;
  }
}
Object.assign(zh, {
  "tabOverview": "\u603B\u89C8",
  "tabDetail": "\u660E\u7EC6",
  "tabExport": "\u5BFC\u51FA",
  "budgetCard": "\u9884\u7B97\u4E0E\u4F59\u989D",
  "projection": "\u9884\u8BA1\u4ECA\u65E5",
  "projectionHint": "\u6309\u5F53\u524D\u65F6\u6BB5\u5300\u901F\u5916\u63A8\uFF0C\u4EC5\u4F5C\u53C2\u8003",
  "monthBudget": "\u672C\u6708\u9884\u7B97",
  "monthSpent": "\u672C\u6708\u5DF2\u7528",
  "monthOff": "\u672A\u8BBE\u7F6E\u672C\u6708\u9884\u7B97\uFF080 = \u5173\u95ED\uFF09",
  "detailTitle": "\u660E\u7EC6\u4E0E\u6392\u884C",
  "detailHint": "\u6309\u65F6\u95F4\u7A97\u53E3\u67E5\u770B\u6A21\u578B / \u4F1A\u8BDD / provider",
  "rangeToday": "\u4ECA\u65E5",
  "range7d": "\u8FD1 7 \u5929",
  "range30d": "\u8FD1 30 \u5929",
  "modelBreakdown": "\u6309\u6A21\u578B",
  "sessionsBreakdown": "\u6309\u4F1A\u8BDD\u660E\u7EC6",
  "modelsUnit": "\u4E2A\u6A21\u578B",
  "sessionsUnit": "\u4E2A\u4F1A\u8BDD",
  "providerBreakdown": "\u6309 provider\uFF08\u7EDF\u8BA1\u7A97\u53E3\uFF09",
  "modelCol": "\u6A21\u578B",
  "providerCol": "provider",
  "tokensCol": "token",
  "shareCol": "\u5360\u6BD4",
  "searchSessions": "\u641C\u7D22\u4F1A\u8BDD\u6807\u9898 / ID",
  "noMatch": "\u6CA1\u6709\u5339\u914D\u7684\u4F1A\u8BDD",
  "allShown": "\u5DF2\u663E\u793A\u5168\u90E8",
  "exportTitle": "\u5BFC\u51FA\u7528\u91CF\u6570\u636E",
  "exportHint": "\u4ECE\u672C\u673A\u805A\u5408\u7ED3\u679C\u5BFC\u51FA\uFF0C\u53EA\u542B token \u6570\u4E0E\u91D1\u989D\uFF0C\u4E0D\u542B\u5BF9\u8BDD\u6B63\u6587\u3001\u6587\u4EF6\u8DEF\u5F84\u6216\u51ED\u636E\u3002",
  "dataset": "\u6570\u636E",
  "scope": "\u8303\u56F4",
  "format": "\u683C\u5F0F",
  "download": "\u4E0B\u8F7D",
  "exporting": "\u5BFC\u51FA\u4E2D\u2026",
  "exportFailed": "\u5BFC\u51FA\u5931\u8D25",
  "exportDone": "\u5DF2\u5BFC\u51FA",
  "dsDaily": "\u6309\u5929",
  "dsSessions": "\u6309\u4F1A\u8BDD",
  "dsModels": "\u6309\u6A21\u578B",
  "scopeToday": "\u4ECA\u65E5",
  "scope7d": "\u8FD1 7 \u5929",
  "scope30d": "\u8FD1 30 \u5929",
  "scopeAll": "\u5168\u90E8",
  "cliTitle": "\u547D\u4EE4\u884C\u62A5\u8868",
  "cliHint": "\u4E0D\u542F\u52A8 DSH \u4E5F\u80FD\u770B\uFF1A\u76F4\u63A5\u8BFB\u672C\u673A\u4F1A\u8BDD\u65E5\u5FD7\uFF0C\u96F6\u5916\u90E8\u4F9D\u8D56\u3002",
  "apiTitle": "HTTP \u63A5\u53E3",
  "apiHint": "\u4E0E\u9762\u677F\u540C\u6E90\uFF0C\u9700\u8981 DSH \u767B\u5F55\u6001\uFF1B\u9002\u5408\u811A\u672C\u6216\u770B\u677F\u62C9\u6570\u3002",
  "copy": "\u590D\u5236",
  "copiedShort": "\u5DF2\u590D\u5236",
  "noDataWindow": "\u8FD9\u4E2A\u7A97\u53E3\u5185\u6CA1\u6709\u7528\u91CF",
  "todayVs": "\u8F83\u6628\u65E5",
  "estimateNote": "\u91D1\u989D\u4E3A\u6309\u5B98\u65B9\u8D39\u7387\u7684\u672C\u673A\u4F30\u7B97\uFF0C\u4E0D\u662F\u5B98\u65B9\u8D26\u5355",
  "localOnlyNote": "\u6309\u4F1A\u8BDD / \u6A21\u578B\u660E\u7EC6\u6765\u81EA\u672C\u5730\u65E5\u5FD7\uFF1B\u6309\u5929\u91D1\u989D\u4E0E\u5B98\u65B9\u4E00\u81F4\u65F6\u4EE5\u5B98\u65B9\u4E3A\u51C6",
  "monthProgress": "\u6708\u5EA6\u8FDB\u5EA6",
  "todayCallsLabel": "\u4ECA\u65E5\u8C03\u7528",
  "balanceCard": "\u8D26\u6237\u4F59\u989D",
  "offPeakHint": "\u7A7A\u95F2\u6863 = \u9AD8\u5CF0\u4EF7\u7684\u4E00\u534A",
  "detailTotals": "\u7A97\u53E3\u5408\u8BA1",
  "budgetOff": "\u4EC5\u8BB0\u5F55\u82B1\u8D39\uFF08\u672A\u8BBE\u6BCF\u65E5\u9884\u7B97\uFF09",
  "budgetOffHint": "\u9884\u7B97\u4E3A 0 \u65F6\u4E0D\u544A\u8B66\u3001\u4E0D\u663E\u793A\u8FDB\u5EA6\u6761\uFF0C\u53EA\u8BB0\u5F55\u82B1\u8D39\uFF1B\u70B9\u8FD9\u91CC\u8BBE\u7F6E\u9884\u7B97",
  "setBudget": "\u8BBE\u7F6E\u9884\u7B97",
  "windowQuarter": "\u672C\u5B63\u5EA6",
  "windowYear": "\u672C\u5E74",
  "wideSourceNote": "\u672C\u6708 / \u5B63\u5EA6 / \u5E74\u6309\u672C\u5730\u65E5\u5FD7\u7EDF\u8BA1\uFF1B\u5B98\u65B9\u7528\u91CF\u63A5\u53E3\u53EA\u8FD4\u56DE\u6700\u8FD1 30 \u5929",
  "rangeMonth": "\u672C\u6708",
  "rangeQuarter": "\u672C\u5B63\u5EA6",
  "rangeYear": "\u672C\u5E74",
  "scopeMonth": "\u672C\u6708",
  "scopeQuarter": "\u672C\u5B63\u5EA6",
  "scopeYear": "\u672C\u5E74"
});
Object.assign(en, {
  "tabOverview": "Overview",
  "tabDetail": "Breakdown",
  "tabExport": "Export",
  "budgetCard": "Budget & balance",
  "projection": "Projected today",
  "projectionHint": "Linear projection from the elapsed day, for reference only",
  "monthBudget": "Monthly budget",
  "monthSpent": "This month",
  "monthOff": "No monthly budget set (0 = off)",
  "detailTitle": "Breakdown & ranking",
  "detailHint": "Models / sessions / providers for a time window",
  "rangeToday": "Today",
  "range7d": "Last 7d",
  "range30d": "Last 30d",
  "modelBreakdown": "By model",
  "sessionsBreakdown": "Sessions",
  "modelsUnit": "models",
  "sessionsUnit": "sessions",
  "providerBreakdown": "By provider (window)",
  "modelCol": "Model",
  "providerCol": "Provider",
  "tokensCol": "Tokens",
  "shareCol": "Share",
  "searchSessions": "Search session title / ID",
  "noMatch": "No matching sessions",
  "allShown": "All shown",
  "exportTitle": "Export usage data",
  "exportHint": "Exported from the local aggregation. Contains token counts and cost only \u2014 no prompts, paths or credentials.",
  "dataset": "Dataset",
  "scope": "Scope",
  "format": "Format",
  "download": "Download",
  "exporting": "Exporting\u2026",
  "exportFailed": "Export failed",
  "exportDone": "Exported",
  "dsDaily": "Daily",
  "dsSessions": "Sessions",
  "dsModels": "Models",
  "scopeToday": "Today",
  "scope7d": "Last 7d",
  "scope30d": "Last 30d",
  "scopeAll": "All",
  "cliTitle": "CLI report",
  "cliHint": "Works without DSH running: reads local session logs, zero dependencies.",
  "apiTitle": "HTTP API",
  "apiHint": "Same origin as the panel and behind DSH auth; suitable for scripts and dashboards.",
  "copy": "Copy",
  "copiedShort": "Copied",
  "noDataWindow": "No usage in this window",
  "todayVs": "vs yesterday",
  "estimateNote": "Costs are local estimates using official rates, not an official invoice",
  "localOnlyNote": "Session/model detail comes from local logs; daily totals prefer official data when available",
  "monthProgress": "Monthly progress",
  "todayCallsLabel": "Calls today",
  "balanceCard": "Balance",
  "offPeakHint": "Off-peak = half of the peak price",
  "detailTotals": "Window total",
  "budgetOff": "Record only (no daily budget)",
  "budgetOffHint": "With a budget of 0 the panel records spend without alerts or progress bars; click to set one",
  "setBudget": "Set budget",
  "windowQuarter": "This quarter",
  "windowYear": "This year",
  "wideSourceNote": "Month / quarter / year use local logs; the official usage API only returns the last 30 days",
  "rangeMonth": "Month",
  "rangeQuarter": "Quarter",
  "rangeYear": "Year",
  "scopeMonth": "Month",
  "scopeQuarter": "Quarter",
  "scopeYear": "Year"
});
var h = import_react.default.createElement;
var BLANK_DAY = {
  miss: 0,
  hit: 0,
  out: 0,
  calls: 0,
  cny: 0,
  hitRate: null,
  byHour: new Array(24).fill(0),
  peakCalls: 0
};
function naturalStartKeyOf(kind, todayKey) {
  const year = todayKey.slice(0, 4);
  if (kind === "year") return `${year}-01-01`;
  const month = Number(todayKey.slice(5, 7));
  if (kind === "quarter") {
    const firstMonth = Math.floor((month - 1) / 3) * 3 + 1;
    return `${year}-${String(firstMonth).padStart(2, "0")}-01`;
  }
  return `${todayKey.slice(0, 7)}-01`;
}
function Chip({ active, onClick, children, title }) {
  return h("div", {
    title,
    onClick,
    style: {
      fontSize: 11,
      padding: "3px 9px",
      borderRadius: 999,
      cursor: "pointer",
      userSelect: "none",
      border: `1px solid ${active ? "var(--dsw-alias-brand-primary-foreground, " + C.brand + ")" : C.border}`,
      background: active ? "var(--dsw-alias-interactive-bg-hover, rgba(47,125,255,.12))" : "transparent",
      color: active ? C.label : C.label3
    }
  }, children);
}
function SectionTitle({ children, right }) {
  return h("div", {
    style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: 11.5, color: C.label3 }
  }, [
    h("span", { key: "t", style: { fontSize: 12.5, fontWeight: 650, color: C.label2 } }, children),
    h("span", { key: "sp", style: { flex: 1 } }),
    right ?? null
  ]);
}
function Progress({ value, color, height = 8, marker = null }) {
  const width = Math.min(Math.max(Number(value) || 0, 0), 100);
  return h("div", {
    style: { position: "relative", height, borderRadius: 99, background: "var(--dsw-alias-border-l1, rgba(128,128,128,.2))" }
  }, [
    h("div", {
      key: "fill",
      style: { height: "100%", width: `${width.toFixed(1)}%`, borderRadius: 99, background: color, transition: "width .3s ease" }
    }),
    marker ? h("div", {
      key: "tick",
      title: marker.title,
      style: {
        position: "absolute",
        left: `${marker.at}%`,
        top: -2,
        width: 2,
        height: height + 4,
        background: C.warn,
        opacity: 0.65,
        borderRadius: 2
      }
    }) : null
  ]);
}
function TokenMeterPanel(props) {
  const { t } = props;
  const [view, setView] = import_react.default.useState("overview");
  const [range, setRange] = import_react.default.useState(30);
  const [detailRange, setDetailRange] = import_react.default.useState("today");
  const [edit, setEdit] = import_react.default.useState(null);
  const [intervalSec, setIntervalSec] = import_react.default.useState(60);
  const { status, data, error, at, refresh } = useSummary(intervalSec);
  const [selDay, setSelDay] = import_react.default.useState(null);
  const [copied, setCopied] = import_react.default.useState("");
  const [showAllSessions, setShowAllSessions] = import_react.default.useState(false);
  const [sessionQuery, setSessionQuery] = import_react.default.useState("");
  const [waitSec, setWaitSec] = import_react.default.useState(0);
  const [exportDataset, setExportDataset] = import_react.default.useState("daily");
  const [exportScope, setExportScope] = import_react.default.useState("7d");
  const [exportFormat, setExportFormat] = import_react.default.useState("csv");
  const [exportState, setExportState] = import_react.default.useState({ busy: false, error: null, done: null });
  const saveSetting = import_react.default.useCallback(async (field, raw) => {
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) {
      setEdit((cur) => cur ? { ...cur, error: "\u9700\u8981\u975E\u8D1F\u6570\u5B57" } : cur);
      return;
    }
    try {
      const res = await fetch(`${ROUTE_BASE}/settings`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ [field]: value })
      });
      const out = await res.json();
      if (!out?.ok) throw new Error(out?.error ?? `HTTP ${res.status}`);
      setEdit(null);
      refresh();
    } catch (err) {
      setEdit((cur) => cur ? { ...cur, error: String(err?.message ?? err) } : cur);
    }
  }, [refresh]);
  const officialLoading = data?.official?.reason === "loading";
  const needsMore = officialLoading || data?.partialScan === true;
  const [officialTries, setOfficialTries] = import_react.default.useState(0);
  import_react.default.useEffect(() => {
    if (!needsMore) {
      if (officialTries) setOfficialTries(0);
      return void 0;
    }
    if (officialTries >= 40) return void 0;
    const id = setTimeout(() => {
      setOfficialTries((n) => n + 1);
      refresh();
    }, 1500);
    return () => clearTimeout(id);
  }, [needsMore, officialTries, refresh]);
  import_react.default.useEffect(() => {
    const sec = data?.config?.refreshSeconds;
    if (typeof sec === "number" && sec > 0 && sec !== intervalSec) setIntervalSec(sec);
  }, [data?.config?.refreshSeconds, intervalSec]);
  const live = useLiveUsage(props);
  const balance = useBalance(Boolean(data?.config?.showBalance));
  import_react.default.useEffect(() => {
    if (status !== "loading" || data) return void 0;
    const id = setInterval(() => setWaitSec((n) => n + 1), 1e3);
    return () => clearInterval(id);
  }, [status, data]);
  const copyText = import_react.default.useCallback(async (key, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1800);
    } catch {
    }
  }, []);
  if (status === "loading" && !data) {
    return h("div", {
      style: { padding: 28, color: C.label3, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }
    }, [
      h("span", {
        key: "sp",
        style: {
          width: 12,
          height: 12,
          borderRadius: "50%",
          display: "inline-block",
          border: `2px solid ${C.border}`,
          borderTopColor: C.brand,
          animation: "dsh-tm-spin .8s linear infinite"
        }
      }),
      h("span", { key: "t" }, `${t("firstLoad")} ${waitSec}s`),
      h("span", { key: "h", style: { fontSize: 11, color: C.label3 } }, t("firstLoadHint"))
    ]);
  }
  if (status === "failed" && !data) {
    return h("div", { style: { padding: 28, color: C.error, fontSize: 13 } }, [
      h("div", { key: "a" }, `${t("failed")}\uFF1A${error}`),
      h("button", {
        key: "b",
        onClick: refresh,
        style: {
          marginTop: 10,
          padding: "5px 12px",
          borderRadius: 8,
          cursor: "pointer",
          border: `1px solid ${C.border}`,
          background: "transparent",
          color: C.label2,
          fontSize: 12
        }
      }, t("retry"))
    ]);
  }
  const days = data.days ?? {};
  const today = data.today;
  const S = skinOf(data.config?.skin);
  const glassOn = data.config?.skin === "glass";
  const D = days[today] ?? BLANK_DAY;
  const dayKeys = Object.keys(days).sort();
  const prevKey = dayKeys.filter((k) => k < today).pop();
  const prev = prevKey ? days[prevKey] : null;
  const unit = { hit: 0.02, miss: 1, out: 4 };
  const cfgRates = data.config?.rates;
  if (cfgRates?.offPeak?.["deepseek-flash"]) {
    const r = data.peakNow ? cfgRates.peak : cfgRates.offPeak;
    const f = r?.["deepseek-flash"];
    if (f) {
      unit.hit = f.cacheHit;
      unit.miss = f.cacheMiss;
      unit.out = f.output;
    }
  }
  const RATE_KEY = { hit: "cacheHit", miss: "cacheMiss", out: "output" };
  const rateOf = (set, which) => set?.[RATE_KEY[which]] ?? set?.[which] ?? unit[which];
  const SD = selDay && days[selDay] ? days[selDay] : D;
  const cHit = D.hit / 1e6 * unit.hit;
  const cMiss = D.miss / 1e6 * unit.miss;
  const cOut = D.out / 1e6 * unit.out;
  const actual = cHit + cMiss + cOut || D.cny || 0;
  const costOf = (which) => {
    if (!SD.tier) return (SD[which] ?? 0) / 1e6 * unit[which];
    const atTier = (tier) => ((SD.tier[tier] ?? {})[which] ?? 0) / 1e6 * rateOf(cfgRates?.[tier]?.["deepseek-flash"], which);
    return atTier("peak") + atTier("offPeak");
  };
  const sHit = costOf("hit");
  const sMiss = costOf("miss");
  const sOut = costOf("out");
  const tokOf = (which) => SD.tier ? (SD.tier.peak?.[which] ?? 0) + (SD.tier.offPeak?.[which] ?? 0) : SD[which] ?? 0;
  const splitDay = selDay && days[selDay] ? selDay : today;
  const splitTotal = sHit + sMiss + sOut > 0 ? sHit + sMiss + sOut : (SD.cny ?? 0) || 1;
  const daySrc = data.meterSource === "official" && data.official?.ok && data.official.days && Object.keys(data.official.days).length ? data.official.days : days;
  const cnyOfKey = (map, key) => {
    const v = map?.[key];
    if (v === null || v === void 0) return 0;
    return Number(typeof v === "object" ? v.cny ?? 0 : v) || 0;
  };
  const keysBack = (n) => Array.from({ length: n }, (_, i) => new Date(Date.now() - i * 864e5 + 8 * 36e5).toISOString().slice(0, 10));
  const sumKeys = (keys) => keys.reduce((acc, key) => acc + cnyOfKey(daySrc, key), 0);
  const last30 = keysBack(30);
  const localDays = data.localDays ?? days;
  const localKeys = Object.keys(localDays).filter((key) => key <= today).sort();
  const sumLocalFrom = (startKey) => localKeys.reduce((acc, key) => key >= startKey ? acc + cnyOfKey(localDays, key) : acc, 0);
  const monthStart = naturalStartKeyOf("month", today);
  const quarterStart = naturalStartKeyOf("quarter", today);
  const yearStart = naturalStartKeyOf("year", today);
  const monthSpent = sumLocalFrom(monthStart);
  const quarterSpent = sumLocalFrom(quarterStart);
  const yearSpent = sumLocalFrom(yearStart);
  const windows = [
    { key: "d7", label: t("window7"), value: sumKeys(last30.slice(0, 7)) },
    { key: "d30", label: t("window30"), value: sumKeys(last30) },
    { key: "month", label: t("windowMonth"), value: monthSpent, local: true },
    { key: "quarter", label: t("windowQuarter"), value: quarterSpent, local: true },
    { key: "year", label: t("windowYear"), value: yearSpent, local: true }
  ];
  const budget = Number(data.config?.dailyBudget) || 0;
  const usedPct = budget > 0 ? pct(D.cny, budget) : 0;
  const alertPct = Number(data.config?.alertAtPercent) || 80;
  const over = budget > 0 && D.cny > budget;
  const warn = budget > 0 && !over && usedPct >= alertPct;
  const bjNow = new Date(Date.now() + 8 * 36e5);
  const elapsedFrac = (bjNow.getUTCHours() * 60 + bjNow.getUTCMinutes()) / 1440;
  const projection = D.calls > 0 && elapsedFrac > 0.03 ? D.cny / elapsedFrac : null;
  const monthBudget = Number(data.config?.monthlyBudget) || 0;
  const monthPct = monthBudget > 0 ? pct(monthSpent, monthBudget) : 0;
  const balData = balance.data;
  const balInfo = balData?.ok ? balData.balance_infos?.[0] : null;
  const balCur = balInfo?.currency === "USD" ? "$" : "\xA5";
  const balGranted = balInfo && Number(balInfo.granted_balance) > 0 ? String(balInfo.granted_balance) : null;
  const lowAlert = Number(data.config?.lowBalanceAlert) || 0;
  const balLow = Boolean(balInfo) && lowAlert > 0 && Number(balInfo.total_balance ?? 0) < lowAlert;
  const balCostRow = (() => {
    const rows = balData?.total_costs;
    if (!Array.isArray(rows) || !rows.length) return null;
    return rows.find((row) => row?.currency === balInfo?.currency) ?? rows[0];
  })();
  const balCost = balCostRow && Number(balCostRow.amount) > 0 ? balCostRow.amount : null;
  const balSource = balData?.source === "account" ? t("balanceAccount") : balData?.source === "apikey" ? t("balanceApiKey") : "";
  const balText = !data.config?.showBalance ? t("notEnabled") : balInfo ? `${balCur}${balInfo.total_balance}` : balance.status === "loading" ? t("balanceLoading") : balData?.reason === "disabled" ? t("notEnabled") : balData?.error ?? t("balanceFailed");
  const official = data.official;
  const officialOk = Boolean(official?.ok);
  const meterOfficial = data.meterSource === "official";
  const shown = D.cny;
  const officialBase = meterOfficial && Number(official?.yesterdayCny) > 0 ? Number(official.yesterdayCny) : null;
  const localBase = prev && prev.cny > 0 ? prev.cny : null;
  const base = meterOfficial ? officialBase : localBase;
  const shownDelta = base ? (shown - base) / base * 100 : null;
  const deltaLabel = meterOfficial ? t("yesterdayLabel") : prevKey ? prevKey.slice(5) : "";
  const window_ = [];
  for (let i = range - 1; i >= 0; i--) {
    const ts = Date.now() - i * 864e5;
    const key = new Date(ts + 8 * 36e5).toISOString().slice(0, 10);
    window_.push({ key, entry: days[key] ?? null });
  }
  const maxTotal = Math.max(...window_.map(({ entry }) => entry ? entry.hit + entry.miss + entry.out : 0), 1);
  const dataDays = window_.filter(({ entry }) => entry && entry.hit + entry.miss + entry.out > 0).length;
  const firstDataIdx = window_.findIndex(({ entry }) => entry && entry.hit + entry.miss + entry.out > 0);
  const trend_ = dataDays > 0 && dataDays < 3 && firstDataIdx > 0 ? window_.slice(firstDataIdx) : window_;
  const maxHour = Math.max(...D.byHour ?? [0], 1);
  const peakHour = (D.byHour ?? []).indexOf(maxHour);
  const peakHoursToday = (() => {
    const bj = new Date(Date.now() + 8 * 36e5);
    const dow = bj.getUTCDay();
    const weekend = dow === 0 || dow === 6;
    return Array.from({ length: 24 }, (_, hour) => !weekend && (hour >= 9 && hour < 12 || hour >= 14 && hour < 18));
  })();
  const cutoffDay = detailRange === "today" ? today : detailRange === "7d" ? dayKeyOf(Date.now() - 6 * 864e5) : detailRange === "30d" ? dayKeyOf(Date.now() - 29 * 864e5) : naturalStartKeyOf(detailRange, today);
  const cutoffMs = Date.parse(`${cutoffDay}T00:00:00+08:00`);
  const detailSource = detailRange === "month" || detailRange === "quarter" || detailRange === "year" ? localDays : days;
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
    const buckets = /* @__PURE__ */ new Map();
    const dayModels = data.dayModels ?? {};
    if (Object.keys(dayModels).length) {
      for (const [key, bucket] of Object.entries(dayModels)) {
        const bar = key.indexOf("|");
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
          calls: bucket.calls ?? 0,
          hit: bucket.hit ?? 0,
          miss: bucket.miss ?? 0,
          out: bucket.out ?? 0,
          cny: bucket.cny ?? 0
        });
      }
    }
    return [...buckets.entries()].map(([key, b]) => ({ key, ...b })).filter((row) => row.calls > 0).sort((a, b) => b.cny - a.cny);
  })();
  const modelTotalCny = modelRows.reduce((acc, row) => acc + row.cny, 0) || 1;
  const sessionRows = Object.values(data.sessions ?? {}).filter((s) => (s.calls ?? 0) > 0 && (s.lastTime ?? 0) >= cutoffMs).sort((a, b) => (b.cny ?? 0) - (a.cny ?? 0));
  const sessionQueryNorm = sessionQuery.trim().toLowerCase();
  const filteredSessions = sessionQueryNorm ? sessionRows.filter((s) => `${s.title ?? ""} ${s.id}`.toLowerCase().includes(sessionQueryNorm)) : sessionRows;
  const maxSessionCny = filteredSessions.length ? Math.max(...filteredSessions.map((s) => s.cny)) : 1;
  const providerRows = Object.entries(data.providers ?? {}).sort(([, a], [, b]) => (b.cny ?? 0) - (a.cny ?? 0));
  const plugin = data.plugin ?? {};
  const update = plugin.update;
  const doExport = async () => {
    setExportState({ busy: true, error: null, done: null });
    try {
      const url = `${ROUTE_BASE}/export?dataset=${exportDataset}&scope=${exportScope}&format=${exportFormat}`;
      const res = await fetch(url, { cache: "no-store", credentials: "same-origin" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const disposition = res.headers.get("content-disposition") ?? "";
      const name = /filename="([^"]+)"/.exec(disposition)?.[1] ?? `dsh-token-cost-${exportDataset}-${exportScope}.${exportFormat}`;
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = name;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(href), 2e3);
      setExportState({ busy: false, error: null, done: name });
    } catch (err) {
      setExportState({ busy: false, error: String(err?.message ?? err), done: null });
    }
  };
  const rightAlign = { textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };
  const cell = (extra = {}) => ({ padding: "6px 8px", borderBottom: `1px solid ${C.border1}`, ...extra });
  const tableHead = (labels, aligns = []) => h("thead", { key: "th" }, h("tr", null, labels.map((label, index) => h("th", {
    key: label + index,
    style: {
      textAlign: aligns[index] ?? (index === 0 ? "left" : "right"),
      fontWeight: 600,
      fontSize: 11,
      color: C.label3,
      padding: "6px 8px",
      borderBottom: `1px solid ${C.border1}`,
      whiteSpace: "nowrap"
    }
  }, label))));
  const tabButton = (key, label) => h("div", {
    key,
    onClick: () => setView(key),
    style: {
      padding: "6px 14px",
      borderRadius: 999,
      cursor: "pointer",
      userSelect: "none",
      fontSize: 12.5,
      fontWeight: view === key ? 700 : 500,
      color: view === key ? C.label : C.label3,
      background: view === key ? "var(--dsw-alias-interactive-bg-hover, rgba(47,125,255,.12))" : "transparent",
      border: `1px solid ${view === key ? C.brand : "transparent"}`
    }
  }, label);
  const dataSourceBadge = h("span", {
    key: "src",
    style: {
      fontSize: 10.5,
      fontWeight: 600,
      padding: "2px 7px",
      borderRadius: 999,
      border: `1px solid ${C.border}`,
      color: officialOk ? C.brand : C.label3,
      verticalAlign: "middle"
    }
  }, meterOfficial ? t("officialLabel") : t("localShort"));
  const overview = h("div", { key: "overview" }, [
    // 第一行：今日消费 + 预算 / 余额
    h("div", {
      key: "hero",
      style: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }
    }, [
      h("div", { key: "spend", style: { ...S.panel, display: "flex", flexDirection: "column", gap: 8 } }, [
        h("div", { key: "l", style: { fontSize: 12, color: C.label2 } }, `${t("today")} \xB7 ${today}`),
        h("div", {
          key: "n",
          style: { fontSize: 34, fontWeight: 750, lineHeight: 1.15, fontVariantNumeric: "tabular-nums", display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }
        }, [
          h("span", { key: "c", style: { fontSize: 16, fontWeight: 600, color: C.label2 } }, "\xA5"),
          shown.toFixed(2),
          dataSourceBadge,
          shownDelta !== null ? h("span", {
            key: "d",
            style: {
              fontSize: 11,
              fontWeight: 600,
              padding: "2px 7px",
              borderRadius: 999,
              color: shownDelta >= 0 ? C.error : C.ok,
              background: "var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,.12))"
            }
          }, `${t("vsPrevOn")} ${deltaLabel} ${shownDelta >= 0 ? "+" : "\u2212"}${Math.abs(shownDelta).toFixed(0)}%`) : null
        ]),
        h("div", {
          key: "meta",
          style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: 11, color: C.label3, fontVariantNumeric: "tabular-nums" }
        }, [
          h("span", { key: "mt" }, `${t("updated")} ${clock(at || data.generatedAt)}`),
          h("div", {
            key: "rf",
            onClick: refresh,
            title: t("refresh"),
            style: {
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11,
              fontWeight: 600,
              padding: "2px 9px",
              borderRadius: 999,
              cursor: "pointer",
              userSelect: "none",
              border: `1px solid ${C.brand}`,
              color: C.brand,
              background: "var(--dsw-alias-interactive-bg-hover, rgba(47,125,255,.10))",
              opacity: status === "loading" ? 0.55 : 1
            }
          }, [h("span", { key: "i", style: { fontSize: 12, lineHeight: 1 } }, "\u27F3"), t("refresh")])
        ]),
        h("div", {
          key: "money",
          style: { marginTop: 4, paddingTop: 8, borderTop: `1px solid ${C.border1}`, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "7px 12px" }
        }, [
          ...windows.map((m) => h("div", { key: m.key, style: { minWidth: 0 } }, [
            h("div", { key: "l", style: { fontSize: 10.5, color: C.label3, whiteSpace: "nowrap" } }, m.label),
            h("div", {
              key: "v",
              style: { fontSize: 15, fontWeight: 650, color: C.label2, fontVariantNumeric: "tabular-nums" }
            }, `\xA5${fmtMoney(m.value)}`)
          ])),
          h("div", {
            key: "wnote",
            style: { gridColumn: "1 / -1", fontSize: 10, color: C.label3, lineHeight: 1.6 }
          }, t("wideSourceNote"))
        ]),
        balCost ? h("div", {
          key: "total",
          style: { fontSize: 11, color: C.label3, fontVariantNumeric: "tabular-nums" }
        }, `${t("totalSpent")} \xA5${fmtMoney(balCost)}`) : null
      ]),
      h("div", { key: "budget", style: { ...S.panel, fontSize: 11.5, color: C.label2, display: "flex", flexDirection: "column", gap: 8 } }, [
        h("div", { key: "h", style: { fontSize: 12, fontWeight: 650, color: C.label2 } }, t("budgetCard")),
        h("div", { key: "b1" }, [
          h("div", { key: "l", style: { display: "flex", alignItems: "baseline", gap: 8, fontSize: 11, marginBottom: 5 } }, [
            budget > 0 ? h("span", {
              key: "n",
              title: t("editBudgetHint"),
              onClick: () => setEdit({ field: "dailyBudget", label: t("budgetUsed"), value: String(budget) }),
              style: { color: C.label3, cursor: "pointer", textDecoration: "underline dotted" }
            }, `${t("budgetUsed")} ${money(budget)} \u270E`) : h("span", {
              key: "n",
              title: t("budgetOffHint"),
              onClick: () => setEdit({ field: "dailyBudget", label: t("budgetUsed"), value: String(budget) }),
              style: { color: C.label2, cursor: "pointer", textDecoration: "underline dotted" }
            }, `${t("budgetOff")} \u270E`),
            h("span", {
              key: "v",
              style: {
                marginLeft: "auto",
                color: over ? C.error : C.label2,
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
                textAlign: "right"
              }
            }, budget > 0 ? `${t("used")} ${usedPct.toFixed(1)}% \xB7 ${t("remain")} ${money(Math.max(0, budget - D.cny))}${over ? ` \xB7 \u26A0 ${t("overBudget")}` : warn ? ` \xB7 \u26A0 ${t("warnLine")} ${alertPct}%` : ""}` : `\u4ECA\u65E5 ${money(D.cny)}`)
          ]),
          budget > 0 ? h(Progress, {
            key: "p",
            value: usedPct,
            color: over ? C.error : warn ? C.warn : C.brand,
            marker: alertPct > 0 && alertPct < 100 ? { at: alertPct, title: `${t("warnLine")} ${alertPct}%` } : null
          }) : h("div", {
            key: "p",
            title: t("budgetOffHint"),
            onClick: () => setEdit({ field: "dailyBudget", label: t("budgetUsed"), value: "50" }),
            style: { fontSize: 10.5, color: C.label3, cursor: "pointer", lineHeight: 1.6 }
          }, t("budgetOffHint")),
          h("div", {
            key: "proj",
            style: { display: "flex", alignItems: "baseline", gap: 6, marginTop: 6, fontSize: 11, color: C.label3 }
          }, [
            h("span", { key: "l" }, `${t("projection")} `),
            h("span", {
              key: "v",
              style: { fontWeight: 650, color: projection !== null && budget > 0 && projection > budget ? C.error : C.label2, fontVariantNumeric: "tabular-nums" }
            }, projection === null ? "\u2014" : money(projection)),
            h("span", { key: "h", title: t("projectionHint"), style: { fontSize: 10.5 } }, "\u24D8")
          ])
        ]),
        h("div", { key: "b2", style: { borderTop: `1px solid ${C.border1}`, paddingTop: 7 } }, [
          h("div", { key: "l", style: { display: "flex", alignItems: "baseline", gap: 8, fontSize: 11, marginBottom: 5 } }, [
            h("span", {
              key: "n",
              title: t("budgetOffHint"),
              onClick: () => setEdit({ field: "monthlyBudget", label: t("monthBudget"), value: String(monthBudget) }),
              style: { color: C.label3, cursor: "pointer", textDecoration: "underline dotted" }
            }, `${t("monthBudget")} \u270E`),
            h(
              "span",
              { key: "v", style: { marginLeft: "auto", color: C.label2, fontWeight: 600, fontVariantNumeric: "tabular-nums" } },
              monthBudget > 0 ? `\xA5${fmtMoney(monthSpent)} / \xA5${fmtMoney(monthBudget)}` : `${t("monthSpent")} \xA5${fmtMoney(monthSpent)} \xB7 ${t("monthOff")}`
            )
          ]),
          monthBudget > 0 ? h(Progress, {
            key: "p",
            value: monthPct,
            color: monthPct >= 100 ? C.error : monthPct >= 80 ? C.warn : C.brand
          }) : null
        ]),
        h("div", { key: "bal", style: { borderTop: `1px solid ${C.border1}`, paddingTop: 7, cursor: "pointer" }, onClick: () => {
          balance.reload();
          refresh();
        } }, [
          h("div", { key: "l", style: { display: "flex", alignItems: "baseline", gap: 6, fontSize: 11, color: C.label3 } }, [
            h("span", { key: "n" }, t("balance")),
            h("span", { key: "r", style: { marginLeft: "auto", fontSize: 12 } }, "\u27F3")
          ]),
          h("div", { key: "v", style: { display: "flex", alignItems: "baseline", gap: 6, marginTop: 1 } }, [
            balInfo ? h("span", {
              key: "n",
              style: {
                fontSize: 23,
                fontWeight: 750,
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "-0.01em",
                color: balLow ? C.error : void 0,
                opacity: balLow ? 0.88 : void 0
              }
            }, [h("span", { key: "c", style: { fontSize: 13, fontWeight: 600, color: C.label2, marginRight: 1 } }, balCur), fmtMoney(balInfo.total_balance)]) : h("span", {
              key: "e",
              style: { fontSize: 12.5, fontWeight: 600, color: balData && balData.ok === false ? C.warn : C.label3 }
            }, balText),
            balGranted ? h("span", { key: "g", style: { fontSize: 10.5, color: C.label3 } }, `${t("inclGranted")} ${balCur}${fmtMoney(balGranted)}`) : null,
            balSource ? h("span", {
              key: "s",
              style: { fontSize: 10, color: C.label3, padding: "1px 6px", borderRadius: 999, border: `1px solid ${C.border}` }
            }, balSource) : null
          ])
        ]),
        balLow ? h("div", {
          key: "lowbal",
          onClick: () => setEdit({ field: "lowBalanceAlert", label: t("lowBalance"), value: String(lowAlert) }),
          title: t("lowBalanceHint"),
          style: { fontSize: 11, cursor: "pointer", color: C.error, opacity: 0.9 }
        }, `\u26A0 ${t("lowBalance")} \xA5${fmtMoney(lowAlert)} \xB7 ${t("editLowHint")} \u270E`) : null,
        edit ? h("div", {
          key: "edit",
          style: { display: "flex", alignItems: "center", gap: 6, paddingTop: 6, borderTop: `1px solid ${C.border1}`, fontSize: 11.5 }
        }, [
          h("span", { key: "l", style: { color: C.label3 } }, `${edit.label} =`),
          h("input", {
            key: "i",
            value: edit.value,
            autoFocus: true,
            inputMode: "decimal",
            onChange: (e) => setEdit((cur) => ({ ...cur, value: e.target.value, error: null })),
            onKeyDown: (e) => {
              if (e.key === "Enter") saveSetting(edit.field, edit.value);
              if (e.key === "Escape") setEdit(null);
            },
            style: {
              width: 76,
              padding: "2px 6px",
              fontSize: 12,
              fontVariantNumeric: "tabular-nums",
              borderRadius: 6,
              border: `1px solid ${C.border}`,
              background: "transparent",
              color: C.label
            }
          }),
          h("span", { key: "s", onClick: () => saveSetting(edit.field, edit.value), style: { cursor: "pointer", color: C.brand, fontWeight: 650 } }, t("save")),
          h("span", { key: "c", onClick: () => setEdit(null), style: { cursor: "pointer", color: C.label3 } }, t("cancel")),
          edit.error ? h("span", { key: "e", style: { color: C.error } }, edit.error) : null
        ]) : null,
        h("div", { key: "src", style: { fontSize: 10.5, color: C.label3, lineHeight: 1.7, borderTop: `1px solid ${C.border1}`, paddingTop: 6 } }, [
          h("div", { key: "rate" }, `${t("rateLine")}\uFF1A${data.peakNow ? t("peak") : t("offpeak")}`),
          officialOk ? h("div", { key: "ok", style: { color: C.label3 } }, `${t("officialLabel")} \u2713 ${official.days ? Object.keys(official.days).length : 0} \u5929`) : h("div", { key: "off" }, `${t("officialLabel")}\uFF1A${official?.reason === "loading" ? t("officialLoading") : official?.reason === "disabled" ? t("officialOff") : official?.reason === "no-credential" ? t("notConnectedChrome") : official?.reason === "no-browser" ? t("noBrowser") : official?.error ?? t("balanceFailed")}`),
          h("div", { key: "link" }, h("a", {
            href: data.billingUrl || "https://platform.deepseek.com/usage",
            target: "_blank",
            rel: "noreferrer",
            style: { color: C.brand, textDecoration: "none" }
          }, `${t("billingLink")} \u2197`))
        ])
      ])
    ]),
    // 第二行：token 统计 + 峰谷价
    h("div", {
      key: "statsRow",
      style: { display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: 12, marginTop: 12 }
    }, [
      h("div", { key: "stats", style: { ...S.panel, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, alignContent: "start" } }, [
        h(Stat, { key: "1", t, surface: S.stat, label: t("hitInput"), color: C.hit, value: fmt(D.hit) }),
        h(Stat, { key: "2", t, surface: S.stat, label: t("hitRate"), value: D.hitRate === null || D.hitRate === void 0 ? "\u2014" : `${D.hitRate}`, unit: "%" }),
        h(Stat, { key: "3", t, surface: S.stat, label: t("missInput"), color: C.miss, value: fmt(D.miss) }),
        h(Stat, { key: "4", t, surface: S.stat, label: t("output"), color: C.out, value: fmt(D.out) }),
        h("div", {
          key: "avg",
          style: { gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, borderTop: `1px solid ${C.border1}`, paddingTop: 8, marginTop: 2 }
        }, [
          h(MiniStat, { key: "tt", label: t("totalTokens"), value: fmt(D.hit + D.miss + D.out) }),
          h(MiniStat, { key: "c", label: t("callsShort"), value: `${D.calls}` }),
          h(MiniStat, { key: "pc", label: t("perCall"), hint: t("perCallHint"), value: D.calls > 0 ? `\xA5${(D.cny / D.calls).toFixed(4)}` : "\u2014" })
        ]),
        h("div", { key: "compose", style: { gridColumn: "1 / -1", borderTop: `1px solid ${C.border1}`, paddingTop: 8, marginTop: 2, fontSize: 11 } }, (() => {
          const total = D.hit + D.miss + D.out;
          const seg = (n, color) => total > 0 ? h("i", { key: color, style: { flexGrow: Math.max(n, total / 2e3), background: color } }) : null;
          return [
            h("div", { key: "h", style: { display: "flex", alignItems: "baseline", gap: 8 } }, [
              h("span", { key: "l", style: { color: C.label3 } }, t("composeTitle")),
              h("span", { key: "v", style: { marginLeft: "auto", color: C.label2, fontWeight: 600, fontVariantNumeric: "tabular-nums" } }, fmt(total))
            ]),
            h("div", { key: "bar", style: { display: "flex", height: 9, borderRadius: 99, overflow: "hidden", marginTop: 7, background: C.border1 } }, [seg(D.hit, C.hit), seg(D.miss, C.miss), seg(D.out, C.out)]),
            h("div", { key: "lg", style: { display: "flex", gap: 12, flexWrap: "wrap", fontSize: 10.5, color: C.label3, marginTop: 5 } }, [
              h(LegendDot, { key: "h", color: C.hit, text: `${t("hitInput")} ${fmt(D.hit)}${total > 0 ? ` \xB7 ${(100 * D.hit / total).toFixed(1)}%` : ""}` }),
              h(LegendDot, { key: "m", color: C.miss, text: `${t("missInput")} ${fmt(D.miss)}${total > 0 ? ` \xB7 ${(100 * D.miss / total).toFixed(1)}%` : ""}` }),
              h(LegendDot, { key: "o", color: C.out, text: `${t("output")} ${fmt(D.out)}${total > 0 ? ` \xB7 ${(100 * D.out / total).toFixed(1)}%` : ""}` })
            ])
          ];
        })())
      ]),
      h("div", { key: "rates", style: { ...S.panel, fontSize: 11, color: C.label3, lineHeight: 1.7 } }, [
        h("div", { key: "h", style: { fontSize: 12, fontWeight: 650, color: C.label2 } }, t("tierTitle")),
        h("div", { key: "tier", style: { marginTop: 4 } }, [
          h("span", { key: "l", style: { color: C.label2, fontWeight: 600 } }, `${t("currentTier")}\uFF1A`),
          h("span", { key: "v", style: { color: data.peakNow ? C.warn : C.label2 } }, data.peakNow ? t("peak") : t("offpeak"))
        ]),
        h("div", { key: "w", style: { fontSize: 10.5, lineHeight: 1.6 } }, t("peakWindow")),
        (() => {
          const rows = [
            { k: "hit", label: t("hitInput"), now: unit.hit, tokens: D.hit },
            { k: "miss", label: t("missInput"), now: unit.miss, tokens: D.miss },
            { k: "out", label: t("output"), now: unit.out, tokens: D.out }
          ];
          const line = { borderTop: `1px solid ${C.border1}` };
          const td = (key, value, style) => h("td", { key, style }, value);
          return h("table", { key: "merge", style: { width: "100%", borderCollapse: "collapse", fontSize: 11, marginTop: 9 } }, [
            h("thead", { key: "th" }, h("tr", null, [
              h("th", { key: "i", style: { textAlign: "left", fontSize: 10.5, fontWeight: 600, color: C.label3, padding: "2px 4px" } }, t("colItem")),
              h("th", { key: "p", style: { textAlign: "right", fontSize: 10.5, fontWeight: 600, color: C.label3, padding: "2px 4px" } }, t("colPrice")),
              h("th", { key: "u", style: { textAlign: "right", fontSize: 10.5, fontWeight: 600, color: C.label3, padding: "2px 4px" } }, t("colUsage")),
              h("th", { key: "s", style: { textAlign: "right", fontSize: 10.5, fontWeight: 600, color: C.label3, padding: "2px 4px" } }, t("colSubtotal"))
            ])),
            h("tbody", { key: "tb" }, [
              ...rows.map((r) => h("tr", { key: r.k }, [
                td("i", r.label, { ...line, padding: "3px 4px", color: C.label2, whiteSpace: "nowrap" }),
                td("p", h("b", { style: { color: C.ok } }, `\xA5${r.now}`), { ...line, ...rightAlign, padding: "3px 4px" }),
                td("u", fmtM(r.tokens), { ...line, ...rightAlign, padding: "3px 4px" }),
                td("s", money(r.tokens / 1e6 * (r.now ?? 0)), { ...line, ...rightAlign, padding: "3px 4px", fontWeight: 650 })
              ])),
              h("tr", { key: "all" }, [
                td("l", t("todayTotal"), { ...line, padding: "3px 4px", textAlign: "right", color: C.label2, fontWeight: 700, colSpan: 3, whiteSpace: "nowrap" }),
                td("v", money(D.cny), { ...line, ...rightAlign, padding: "3px 4px", fontWeight: 750, color: C.label })
              ])
            ])
          ]);
        })(),
        D.tier ? h(
          "div",
          { key: "tiernote", style: { fontSize: 10.5, color: C.label3, marginTop: 6 } },
          `${t("byLocalTier")}\uFF1A${t("tierOffShort")} ${money(D.tier.offPeak?.cny ?? 0)} \xB7 ${t("tierPeakShort")} ${money(D.tier.peak?.cny ?? 0)}`
        ) : null,
        h("div", { key: "note", style: { fontSize: 10.5, marginTop: 6, lineHeight: 1.6 } }, t("rateFootnote"))
      ])
    ]),
    // 趋势
    h("div", { key: "trend", style: S.card }, [
      h(SectionTitle, { key: "h", right: h("div", { style: { display: "flex", gap: 6 } }, [
        h(Chip, { key: "r7", active: range === 7, onClick: () => setRange(7) }, t("range7")),
        h(Chip, { key: "r30", active: range === 30, onClick: () => setRange(30) }, t("range30")),
        dataDays < 3 ? h("span", {
          key: "few",
          style: { fontSize: 10.5, color: C.label3, border: `1px solid ${C.border}`, borderRadius: 999, padding: "1px 8px", whiteSpace: "nowrap" }
        }, t("fewDays")) : null
      ]) }, t("trend")),
      h("div", {
        key: "bars",
        style: {
          position: "relative",
          display: "flex",
          alignItems: "flex-end",
          gap: range > 10 ? 3 : 8,
          height: 108,
          marginTop: 16,
          justifyContent: trend_.length <= 4 ? "center" : "flex-start"
        }
      }, trend_.map(({ key, entry }) => {
        const total = entry ? entry.hit + entry.miss + entry.out : 0;
        const heightPct = total > 0 ? Math.max(4, total / maxTotal * 100) : 2;
        const isToday = key === today;
        const selected = selDay ? selDay === key : isToday;
        const label = `${key}${isToday ? ` \xB7 ${t("today")}` : ""}`;
        const tooltip = entry ? `${label}
${t("cost")} ${money(entry.cny)} \xB7 ${entry.calls} ${t("calls")}
${t("hitInput")} ${fmt(entry.hit)} \xB7 ${t("missInput")} ${fmt(entry.miss)} \xB7 ${t("output")} ${fmt(entry.out)}` : `${label} \xB7 ${t("zeroDays")}`;
        return h("div", {
          key,
          title: `${tooltip}
${t("clickForSplit")}`,
          onClick: () => setSelDay(selDay === key ? null : key),
          style: {
            flex: 1,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            outline: selected ? `1px dashed ${C.brand}` : "none",
            outlineOffset: 2,
            borderRadius: 6,
            minWidth: 0,
            cursor: "pointer",
            maxWidth: trend_.length <= 4 ? 78 : "none",
            position: "relative"
          }
        }, [
          total > 0 ? h("div", {
            key: "val",
            style: {
              position: "absolute",
              left: 0,
              right: 0,
              bottom: `calc(${heightPct}% + 5px)`,
              textAlign: "center",
              fontSize: trend_.length <= 7 ? 10.5 : 9.5,
              fontWeight: 600,
              color: isToday ? C.brand : C.label2,
              fontVariantNumeric: "tabular-nums",
              pointerEvents: "none",
              whiteSpace: "nowrap"
            }
          }, entry.cny > 0 ? trend_.length <= 7 ? money(entry.cny) : `\xA5${Math.round(entry.cny)}` : "") : null,
          total > 0 ? h("div", {
            key: "s",
            style: {
              height: `${heightPct}%`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              borderRadius: "5px 5px 3px 3px",
              overflow: "hidden",
              width: heightPct < 10 ? "46%" : "100%",
              alignSelf: "center",
              minWidth: 6
            }
          }, [
            h("div", { key: "o", style: { flex: Math.max(entry.out, 1), minHeight: 3, background: C.out } }),
            h("div", { key: "m", style: { flex: Math.max(entry.miss, 1), minHeight: 3, background: C.miss } }),
            h("div", { key: "h", style: { flex: Math.max(entry.hit, 1), minHeight: 3, background: C.hit } })
          ]) : h("div", {
            key: "z",
            style: { height: "2%", minHeight: 2, background: "var(--dsw-alias-border-l2, rgba(128,128,128,.3))", borderRadius: 3 }
          })
        ]);
      })),
      h("div", {
        key: "x",
        style: {
          display: "flex",
          gap: range > 10 ? 3 : 8,
          marginTop: 6,
          paddingTop: 4,
          borderTop: `1px solid ${C.border1}`,
          justifyContent: trend_.length <= 4 ? "center" : "flex-start"
        }
      }, trend_.length > 31 ? [h("div", { key: "range", style: { flex: 1, textAlign: "center", fontSize: 10, color: C.label3 } }, `${trend_[0].key.slice(5)} \u2192 ${trend_[trend_.length - 1].key.slice(5)}`)] : trend_.map(({ key }, index) => h("div", {
        key,
        style: {
          flex: 1,
          textAlign: "center",
          fontSize: 10,
          minWidth: 0,
          overflow: "hidden",
          whiteSpace: "nowrap",
          color: key === today ? C.brand : C.label3,
          opacity: days[key] ? 1 : 0.4,
          fontWeight: key === today ? 700 : 400,
          maxWidth: trend_.length <= 4 ? 78 : "none"
        }
      }, key === today ? t("today") : index % 3 === 0 ? key.slice(5) : ""))),
      h("div", { key: "hr", style: { marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border1}` } }, [
        h("div", { key: "hh", style: { display: "flex", alignItems: "center", fontSize: 11.5, color: C.label3, gap: 8 } }, [
          h("span", { key: "t", style: { fontWeight: 650, color: C.label2 } }, t("byHour")),
          h("span", { key: "sp", style: { flex: 1 } }),
          h("span", { key: "p" }, `${String(peakHour).padStart(2, "0")}:00 \xB7 ${t("peakHourLabel")} ${fmt(maxHour)} tokens`)
        ]),
        h("div", { key: "bars", style: { position: "relative", display: "flex", alignItems: "flex-end", gap: 2, height: 42, marginTop: 22 } }, [
          ...[50, 100].map((p) => h("div", { key: `grid${p}`, style: { position: "absolute", left: 0, right: 0, bottom: `${p}%`, borderTop: `1px dashed ${C.border1}`, pointerEvents: "none" } })),
          ...Array.from({ length: 24 }, (_, hour) => h("div", {
            key: hour,
            title: `${String(hour).padStart(2, "0")}:00 \xB7 ${fmt(D.byHour?.[hour] ?? 0)} tokens`,
            style: {
              position: "relative",
              zIndex: 1,
              flex: 1,
              minHeight: 2,
              height: `${Math.max((D.byHour?.[hour] ?? 0) / maxHour * 100, 1.5)}%`,
              background: peakHoursToday[hour] ? C.miss : C.hit,
              opacity: hour === peakHour ? 1 : 0.72,
              borderRadius: "2px 2px 0 0"
            }
          }))
        ]),
        h(
          "div",
          { key: "ax", style: { display: "flex", gap: 2, fontSize: 9, color: C.label3, marginTop: 4 } },
          Array.from({ length: 24 }, (_, hour) => h("span", {
            key: hour,
            style: { flex: 1, minWidth: 0, textAlign: "center", fontVariantNumeric: "tabular-nums" }
          }, String(hour).padStart(2, "0")))
        )
      ])
    ]),
    // 成本构成
    h("div", { key: "split", style: S.card }, [
      h(SectionTitle, { key: "h", right: h("div", { style: { display: "flex", gap: 8, alignItems: "baseline" } }, [
        splitDay === today ? null : h("span", { key: "back", onClick: () => setSelDay(null), style: { cursor: "pointer", color: C.brand, userSelect: "none" } }, `\u21A9 ${t("today")}`),
        h("span", { key: "tot", style: { color: C.label3, fontVariantNumeric: "tabular-nums" } }, `${t("fromOfficial")} ${money(SD.cny ?? 0)}`)
      ]) }, `${splitDay === today ? t("costSplit") : `${t("costSplit")} \xB7 ${splitDay.slice(5)}`}`),
      h(
        "div",
        { key: "rows", style: { display: "flex", flexDirection: "column", gap: 9, marginTop: 10 } },
        [
          [t("output"), C.out, sOut, tokOf("out")],
          [t("missInput"), C.miss, sMiss, tokOf("miss")],
          [t("hitInput"), C.hit, sHit, tokOf("hit")]
        ].map(([label, color, cost, tokens]) => h("div", {
          key: label,
          style: { display: "grid", gridTemplateColumns: "112px 84px 76px 1fr", gap: 10, alignItems: "center", fontSize: 12 }
        }, [
          h(
            "div",
            { key: "n", style: { display: "flex", alignItems: "center", gap: 6, color: C.label2, whiteSpace: "nowrap" } },
            [h("i", { key: "i", style: swatch(color) }), label]
          ),
          h("div", { key: "k", style: { textAlign: "right", fontSize: 11, color: C.label3, fontVariantNumeric: "tabular-nums" } }, fmtM(tokens)),
          h("div", { key: "v", style: { textAlign: "right", fontWeight: 650, color: C.label, fontVariantNumeric: "tabular-nums" } }, money(cost)),
          h("div", { key: "tr", style: { display: "flex", alignItems: "center", paddingRight: 40 } }, [
            h("div", { key: "track", style: { position: "relative", flex: 1, minWidth: 0, height: 9, borderRadius: 99, background: "var(--dsw-alias-border-l1, rgba(128,128,128,.18))" } }, [
              h("div", { key: "fill", style: { height: "100%", width: `${pct(cost, splitTotal).toFixed(1)}%`, background: color, borderRadius: 99 } }),
              h("span", { key: "p", style: { position: "absolute", left: `calc(${pct(cost, splitTotal).toFixed(1)}% + 6px)`, top: -3, fontSize: 11, fontWeight: 600, color: C.label2, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" } }, `${pct(cost, splitTotal).toFixed(0)}%`)
            ])
          ])
        ]))
      )
    ]),
    // 历史（按天）
    (() => {
      const historyDays = Object.keys(days).sort().reverse().slice(0, 30).map((key) => ({ date: key, ...days[key] ?? {} })).filter((d) => (d.cny ?? 0) > 0 || (d.calls ?? 0) > 0);
      if (!historyDays.length) return null;
      return h("div", { key: "hist", style: S.card }, [
        h(SectionTitle, { key: "h", right: h("span", { key: "s", style: { fontSize: 10.5 } }, meterOfficial ? `platform.deepseek.com/api/v0/usage \xB7 ${historyDays.length} \u5929` : `${t("localShort")} \xB7 ${historyDays.length} \u5929`) }, t("historyTitle")),
        h("table", { key: "tb", style: { width: "100%", borderCollapse: "collapse", fontSize: 12.5, marginTop: 8 } }, [
          tableHead(["\u65E5\u671F", t("cost"), t("hitInput"), t("missInput"), t("output"), t("callsShort")], ["left", "right", "right", "right", "right", "right"]),
          h("tbody", { key: "tb" }, historyDays.map((d) => h("tr", { key: d.date }, [
            h("td", { key: "d", style: cell({ color: d.date === today ? C.brand : C.label2, fontWeight: d.date === today ? 700 : 400, whiteSpace: "nowrap" }) }, d.date),
            h("td", { key: "c", style: cell({ ...rightAlign, fontWeight: 650, color: C.label }) }, money(d.cny)),
            h("td", { key: "h", style: cell({ ...rightAlign, color: C.label2 }) }, fmt(d.hit)),
            h("td", { key: "m", style: cell({ ...rightAlign, color: C.label2 }) }, fmt(d.miss)),
            h("td", { key: "o", style: cell({ ...rightAlign, color: C.label2 }) }, fmt(d.out)),
            h("td", { key: "n", style: cell({ ...rightAlign, color: C.label3 }) }, d.calls ?? 0)
          ])))
        ])
      ]);
    })(),
    // 本会话实时
    live ? h("div", { key: "live", style: S.card }, [
      h(SectionTitle, { key: "h", right: h("span", { key: "n", style: { fontSize: 10.5 } }, t("liveHint")) }, t("live")),
      h("div", {
        key: "g",
        style: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 10, marginTop: 10 }
      }, [
        h(Stat, { key: "a", t, label: t("missInput"), color: C.miss, value: fmt(live.uncachedInputTokens) }),
        h(Stat, { key: "b", t, label: t("hitInput"), color: C.hit, value: fmt(live.cacheReadTokens) }),
        h(Stat, { key: "c", t, label: t("output"), color: C.out, value: fmt(live.outputTokens) })
      ])
    ]) : null
  ]);
  const detail = h("div", { key: "detail" }, [
    h("div", { key: "head", style: { ...S.card, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } }, [
      h("div", { key: "t", style: { fontSize: 12.5, fontWeight: 650, color: C.label2 } }, t("detailTitle")),
      h("div", { key: "chips", style: { display: "flex", gap: 6, flexWrap: "wrap" } }, [
        h(Chip, { key: "today", active: detailRange === "today", onClick: () => setDetailRange("today") }, t("rangeToday")),
        h(Chip, { key: "7d", active: detailRange === "7d", onClick: () => setDetailRange("7d") }, t("range7d")),
        h(Chip, { key: "30d", active: detailRange === "30d", onClick: () => setDetailRange("30d") }, t("range30d")),
        h(Chip, { key: "month", active: detailRange === "month", onClick: () => setDetailRange("month") }, t("rangeMonth")),
        h(Chip, { key: "quarter", active: detailRange === "quarter", onClick: () => setDetailRange("quarter") }, t("rangeQuarter")),
        h(Chip, { key: "year", active: detailRange === "year", onClick: () => setDetailRange("year") }, t("rangeYear"))
      ]),
      h("span", { key: "sp", style: { flex: 1 } }),
      h(
        "span",
        { key: "tot", style: { fontSize: 11, color: C.label3, fontVariantNumeric: "tabular-nums" } },
        `${t("detailTotals")} \xA5${fmtMoney(detailTotals.cny)} \xB7 ${detailTotals.calls} ${t("calls")}`
      )
    ]),
    // 按模型
    h("div", { key: "models", style: S.card }, [
      h(SectionTitle, { key: "h", right: h("span", { key: "n", style: { fontSize: 10.5 } }, `${modelRows.length} ${t("modelsUnit")}`) }, t("modelBreakdown")),
      modelRows.length === 0 ? h("div", { key: "e", style: { fontSize: 12, color: C.label3, padding: "12px 0" } }, t("noDataWindow")) : h("div", { key: "tb", style: { marginTop: 8, overflowX: "auto" } }, h("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 12.5 } }, [
        tableHead([t("modelCol"), t("callsShort"), t("tokensCol"), t("cost"), t("shareCol")]),
        h("tbody", { key: "tb" }, modelRows.map((row) => h("tr", { key: row.key }, [
          h("td", { key: "m", style: cell({ color: C.label2, whiteSpace: "nowrap" }), title: row.key }, row.key),
          h("td", { key: "c", style: cell({ ...rightAlign, color: C.label2 }) }, row.calls),
          h("td", { key: "k", style: cell({ ...rightAlign, color: C.label2 }) }, fmt(row.hit + row.miss + row.out)),
          h("td", { key: "v", style: cell({ ...rightAlign, fontWeight: 650, color: C.label }) }, money(row.cny)),
          h("td", { key: "s", style: cell({ width: "22%" }) }, h(Progress, {
            value: pct(row.cny, modelTotalCny),
            height: 7,
            color: row.cny === 0 ? C.label3 : C.brand
          }))
        ])))
      ]))
    ]),
    // 按会话
    h("div", { key: "sessions", style: S.card }, [
      h(SectionTitle, { key: "h", right: h("div", { key: "r", style: { display: "flex", alignItems: "center", gap: 8 } }, [
        h("input", {
          key: "q",
          value: sessionQuery,
          onChange: (e) => setSessionQuery(e.target.value),
          placeholder: t("searchSessions"),
          style: {
            width: 200,
            padding: "3px 8px",
            fontSize: 11.5,
            borderRadius: 8,
            border: `1px solid ${C.border}`,
            background: "transparent",
            color: C.label,
            fontFamily: "inherit"
          }
        }),
        h("span", { key: "n", style: { fontSize: 10.5 } }, `${filteredSessions.length} ${t("sessionsUnit")}`)
      ]) }, t("sessionsBreakdown")),
      filteredSessions.length === 0 ? h("div", { key: "e", style: { fontSize: 12, color: C.label3, padding: "12px 0" } }, sessionQuery ? t("noMatch") : t("noDataWindow")) : h("div", { key: "tb", style: { marginTop: 8, overflowX: "auto" } }, h("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 12.5 } }, [
        tableHead([t("session"), t("lastCall"), t("tokensCol"), t("callsShort"), t("cost"), t("shareCol")]),
        h("tbody", { key: "tb" }, filteredSessions.slice(0, showAllSessions ? filteredSessions.length : 12).map((s) => h("tr", { key: s.id }, [
          h("td", {
            key: "n",
            title: s.title ?? s.id,
            style: cell({ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: C.label2 })
          }, [
            s.isSubagent ? h("span", { key: "tag", style: { fontSize: 10, padding: "1px 5px", borderRadius: 5, marginRight: 6, border: `1px solid ${C.border}`, color: C.label3, whiteSpace: "nowrap" } }, t("subagent")) : null,
            s.title ?? `(${s.id.slice(0, 12)})`,
            s.workspace ? h("span", { key: "w", style: { fontSize: 10, color: C.label3, marginLeft: 6 } }, s.workspace) : null
          ]),
          h("td", { key: "t", style: cell({ ...rightAlign, color: C.label3 }) }, hhmm(s.lastTime)),
          h("td", { key: "k", style: cell({ ...rightAlign, color: C.label2 }) }, fmt(s.hit + s.miss + s.out)),
          h("td", { key: "c", style: cell({ ...rightAlign, color: C.label3 }) }, s.calls),
          h("td", { key: "v", style: cell({ ...rightAlign, fontWeight: 650, color: C.label }) }, money(s.cny)),
          h("td", { key: "s", style: cell({ width: "18%" }) }, h(Progress, { value: pct(s.cny, maxSessionCny), height: 7, color: C.brand }))
        ]))),
        filteredSessions.length > 12 ? h("tfoot", { key: "tf" }, h("tr", null, h("td", {
          colSpan: 6,
          onClick: () => setShowAllSessions((v) => !v),
          style: { padding: "7px 8px", fontSize: 11.5, color: C.brand, cursor: "pointer", userSelect: "none" }
        }, showAllSessions ? t("collapseSessions") : `${t("showAllSessions")} (${filteredSessions.length})`))) : null
      ]))
    ]),
    // provider（统计窗口口径）
    providerRows.length > 1 ? h("div", { key: "providers", style: S.card }, [
      h(SectionTitle, { key: "h", right: h("span", { key: "n", style: { fontSize: 10.5 } }, t("providerBreakdown")) }, t("providerBreakdown")),
      h("div", { key: "list", style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 } }, providerRows.map(([provider, value]) => h("div", {
        key: provider,
        style: { border: `1px solid ${C.border1}`, borderRadius: 10, padding: "6px 10px", fontSize: 11.5, display: "flex", alignItems: "baseline", gap: 8 }
      }, [
        h("span", { key: "p", style: { color: C.label2, fontWeight: 600 } }, provider),
        h("span", { key: "t", style: { color: C.label3, fontVariantNumeric: "tabular-nums" } }, `${fmt(value.tokens)} tokens`),
        h("span", { key: "c", style: { color: C.label2, fontVariantNumeric: "tabular-nums" } }, `\xA5${fmtMoney(value.cny)}`)
      ])))
    ]) : null
  ]);
  const exportOption = (key, label, current, setter) => h("div", {
    key,
    onClick: () => setter(current === key ? current : key),
    style: {
      padding: "4px 12px",
      borderRadius: 8,
      cursor: "pointer",
      userSelect: "none",
      fontSize: 11.5,
      border: `1px solid ${current === key ? C.brand : C.border}`,
      background: current === key ? "var(--dsw-alias-interactive-bg-hover, rgba(47,125,255,.12))" : "transparent",
      color: current === key ? C.label : C.label3
    }
  }, label);
  const exportRow = (label, options) => h("div", {
    key: label,
    style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", fontSize: 11.5, color: C.label3 }
  }, [h("span", { key: "l", style: { width: 44, flex: "none" } }, label), ...options]);
  const commandLines = [
    "node tools/report.mjs --days 7",
    "node tools/report.mjs --json",
    "node tools/report.mjs --csv daily"
  ];
  const apiLines = [
    `GET ${ROUTE_BASE}/export?dataset=daily&scope=7d&format=csv`,
    `GET ${ROUTE_BASE}/export?dataset=sessions&scope=30d&format=json`,
    `GET ${ROUTE_BASE}/export?dataset=models&scope=all&format=csv`
  ];
  const codeBlock = (key, lines) => h(
    "div",
    { key, style: { marginTop: 8, display: "flex", flexDirection: "column", gap: 6 } },
    lines.map((line) => h("div", { key: line, style: { display: "flex", alignItems: "center", gap: 8 } }, [
      h("code", {
        key: "c",
        style: {
          flex: 1,
          fontSize: 11,
          padding: "5px 8px",
          borderRadius: 7,
          background: C.layer2,
          color: C.label2,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          overflow: "auto",
          whiteSpace: "nowrap"
        }
      }, line),
      h("span", {
        key: "cp",
        onClick: () => copyText(line, line),
        style: { cursor: "pointer", color: C.brand, fontSize: 11, userSelect: "none", whiteSpace: "nowrap" }
      }, copied === line ? t("copiedShort") : t("copy"))
    ]))
  );
  const exportView = h("div", { key: "export" }, [
    h("div", { key: "main", style: S.card }, [
      h(SectionTitle, { key: "h" }, t("exportTitle")),
      h("div", { key: "hint", style: { fontSize: 11, color: C.label3, marginTop: 4, lineHeight: 1.7 } }, t("exportHint")),
      h("div", { key: "opts", style: { display: "flex", flexDirection: "column", gap: 10, marginTop: 12 } }, [
        exportRow(t("dataset"), [
          exportOption("daily", t("dsDaily"), exportDataset, setExportDataset),
          exportOption("sessions", t("dsSessions"), exportDataset, setExportDataset),
          exportOption("models", t("dsModels"), exportDataset, setExportDataset)
        ]),
        exportRow(t("scope"), [
          exportOption("today", t("scopeToday"), exportScope, setExportScope),
          exportOption("7d", t("scope7d"), exportScope, setExportScope),
          exportOption("30d", t("scope30d"), exportScope, setExportScope),
          exportOption("month", t("scopeMonth"), exportScope, setExportScope),
          exportOption("quarter", t("scopeQuarter"), exportScope, setExportScope),
          exportOption("year", t("scopeYear"), exportScope, setExportScope),
          exportOption("all", t("scopeAll"), exportScope, setExportScope)
        ]),
        exportRow(t("format"), [
          exportOption("csv", "CSV", exportFormat, setExportFormat),
          exportOption("json", "JSON", exportFormat, setExportFormat)
        ])
      ]),
      h("div", { key: "actions", style: { display: "flex", alignItems: "center", gap: 10, marginTop: 14 } }, [
        h("button", {
          key: "dl",
          onClick: doExport,
          disabled: exportState.busy,
          style: {
            padding: "7px 16px",
            borderRadius: 9,
            cursor: exportState.busy ? "default" : "pointer",
            border: `1px solid ${C.brand}`,
            background: "var(--dsw-alias-interactive-bg-hover, rgba(47,125,255,.12))",
            color: C.brand,
            fontSize: 12,
            fontWeight: 650,
            opacity: exportState.busy ? 0.6 : 1
          }
        }, exportState.busy ? t("exporting") : t("download")),
        exportState.error ? h("span", { key: "e", style: { fontSize: 11.5, color: C.error } }, `${t("exportFailed")}\uFF1A${exportState.error}`) : null,
        exportState.done ? h("span", { key: "d", style: { fontSize: 11.5, color: C.ok } }, `${t("exportDone")} \xB7 ${exportState.done}`) : null
      ]),
      h("div", { key: "note", style: { fontSize: 10.5, color: C.label3, marginTop: 10, lineHeight: 1.7 } }, t("localOnlyNote"))
    ]),
    h("div", { key: "cli", style: S.card }, [
      h(SectionTitle, { key: "h" }, t("cliTitle")),
      h("div", { key: "hint", style: { fontSize: 11, color: C.label3, marginTop: 4 } }, t("cliHint")),
      codeBlock("code", commandLines)
    ]),
    h("div", { key: "api", style: S.card }, [
      h(SectionTitle, { key: "h" }, t("apiTitle")),
      h("div", { key: "hint", style: { fontSize: 11, color: C.label3, marginTop: 4 } }, t("apiHint")),
      codeBlock("code", apiLines)
    ])
  ]);
  const footer = h("div", { key: "foot", style: { marginTop: 12, fontSize: 11, color: C.label3, lineHeight: 1.8 } }, [
    h(
      "div",
      { key: "ab" },
      `${t("updated")} ${clock(at || data.generatedAt)} \xB7 ${t("partial")}${data.partialScan ? ` \xB7 ${t("scanning")}` : ""} \xB7 ${data.filesScanned} \u4E2A\u4F1A\u8BDD\u6587\u4EF6${data.filesReused > 0 ? `\uFF08\u590D\u7528 ${data.filesReused}\uFF09` : ""} \xB7 \u626B\u63CF ${data.elapsedMs}ms` + (data.filesOutsideWindow > 0 ? ` \xB7 \u7A97\u53E3\u5916 ${data.filesOutsideWindow}` : "") + ` \xB7 ${t("estimateNote")}`
    ),
    h("div", { key: "ver", style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 2 } }, [
      h("span", { key: "n" }, `${plugin.name ?? PKG_NAME} v${plugin.version ?? "?"}`),
      h("span", { key: "s1" }, "\xB7"),
      h("a", {
        key: "lic",
        href: `${plugin.repo ?? `https://github.com/${"catgrandfa/dsh-token-cost"}`}/blob/main/LICENSE`,
        target: "_blank",
        rel: "noreferrer",
        style: { color: C.label3, textDecoration: "underline" }
      }, `${plugin.license ?? "MIT"} ${t("licenseLabel")}`),
      update?.hasUpdate ? h("span", { key: "up", style: { display: "flex", alignItems: "center", gap: 6, marginLeft: 4 } }, [
        h("span", { key: "b", style: { color: C.warn, fontWeight: 600, padding: "1px 7px", borderRadius: 999, border: `1px solid ${C.warn}` } }, `${t("updateAvailable")} v${update.latest}`),
        h(
          "span",
          { key: "st", style: { color: update.error ? C.error : C.label3 } },
          update.applied ? t("updateApplied") : update.running ? t("updateRunning") : update.error ? t("updateFailed") : t("updateAuto")
        ),
        h("span", {
          key: "cp",
          onClick: () => copyText("update", update.command),
          style: { cursor: "pointer", color: C.brand, userSelect: "none" }
        }, copied === "update" ? t("copied") : t("copyCmd")),
        h("a", { key: "d", href: update.url, target: "_blank", rel: "noreferrer", style: { color: C.brand, textDecoration: "none" } }, `${t("viewRelease")} \u2197`)
      ]) : null
    ]),
    error ? h("div", { key: "d", style: { color: C.warn } }, `${t("failed")}\uFF1A${error}`) : null
  ]);
  return h("div", {
    style: {
      height: "100%",
      overflow: "auto",
      padding: "16px 18px 40px",
      position: "relative",
      color: C.label,
      fontFamily: 'var(--dsw-font-family, system-ui, "Microsoft YaHei UI", sans-serif)',
      fontSize: 13,
      boxSizing: "border-box"
    }
  }, [
    glassOn ? h("div", {
      key: "aurora",
      "aria-hidden": "true",
      style: {
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
        background: [
          "color-mix(in srgb, var(--dsw-alias-bg-layer-1) 16%, transparent)",
          "radial-gradient(50% 32% at 14% 0%, color-mix(in srgb, var(--dsw-alias-brand-primary, #2f7dff) 55%, transparent), transparent 66%)",
          "radial-gradient(38% 28% at 98% 6%, rgba(150,96,255,.42), transparent 70%)",
          "radial-gradient(44% 30% at 78% 100%, rgba(0,196,178,.34), transparent 72%)",
          "radial-gradient(32% 24% at 22% 92%, rgba(255,120,190,.22), transparent 72%)"
        ].join(","),
        filter: "blur(40px) saturate(140%)",
        transform: "translateZ(0)"
      }
    }) : null,
    h("div", { key: "body", style: { position: "relative", zIndex: 1 } }, [
      h("div", { key: "head", style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 } }, [
        h("div", { key: "ti", style: { minWidth: 0 } }, [
          h("div", { key: "l1", style: { fontWeight: 700, fontSize: 15 } }, [
            t("title"),
            h("span", { key: "s", style: { fontWeight: 500, fontSize: 12, color: C.label3, marginLeft: 6 } }, `\xB7 ${t("subtitle")}`)
          ])
        ]),
        h("div", { key: "sp", style: { flex: 1 } })
      ]),
      h("div", { key: "tabs", style: { display: "flex", gap: 8, marginBottom: 12 } }, [
        tabButton("overview", t("tabOverview")),
        tabButton("detail", t("tabDetail")),
        tabButton("export", t("tabExport"))
      ]),
      view === "overview" ? overview : null,
      view === "detail" ? detail : null,
      view === "export" ? exportView : null,
      footer
    ])
  ]);
}
var inject = ["slots", "locale"];
function apply(ctx) {
  ctx.effect(() => ctx.locale.register(LOCALE_NS, { zh, en }), `${LOCALE_NS}: dictionaries`);
  let sidebarCost = null;
  let entryDispose = null;
  const sidebarLabel = () => sidebarCost == null ? "Token" : `Token \xB7 \xA5${fmtMoney(sidebarCost)}`;
  const mountSidebarEntry = () => {
    if (!ctx.slots?.register) return;
    try {
      entryDispose?.();
    } catch {
    }
    try {
      entryDispose = ctx.slots.register({
        name: "sidebar.panellist",
        id: SLOT_ID,
        order: 90,
        label: sidebarLabel,
        locale: LOCALE_NS
      }, (props) => import_react.default.createElement(MeterIcon, { size: props?.size ?? 16, active: props?.active }));
    } catch {
      entryDispose = null;
    }
  };
  ctx.slots.inject("sidebar.panellist", () => {
    mountSidebarEntry();
    return () => {
      try {
        entryDispose?.();
      } catch {
      }
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
      if (!entryDispose) mountSidebarEntry();
      if (lastSummary && Date.now() - lastSummary.at < 5 * 60 * 1e3) {
        applySidebarCost(lastSummary.data);
        return;
      }
      if (Date.now() - mountedAt < 45 * 1e3) return;
      if (Date.now() - lastScanAt < 120 * 1e3) return;
      lastScanAt = Date.now();
      try {
        const response = await fetch(`${ROUTE_BASE}/summary`, { cache: "no-store", credentials: "same-origin" });
        const body = await response.json();
        if (body?.ok) applySidebarCost(body.data);
      } catch {
      }
    };
    const timer = setInterval(tick, 20 * 1e3);
    tick();
    return () => clearInterval(timer);
  }, "token-cost: sidebar preview");
  ctx.slots.inject("main", () => ctx.slots.register({
    name: "main",
    key: SLOT_ID,
    locale: LOCALE_NS
  }, TokenMeterPanel));
}
return module.exports; } });
//# sourceMappingURL=client.js.map
