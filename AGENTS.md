# AGENTS.md — dsh-token-cost

> 给编码 agent 的**路由层**：只写「权威文档在哪」和「容易做错的动作」。本文件 ≤100 行。

## 这个项目是什么

DSH（DeepSeek Harness）的 Token 花费面板插件：三视图（总览 / 明细 / 导出）、
DeepSeek + GLM（智谱）/ Kimi（月之暗面）按模型计价、无预算模式、侧栏今日花费预览、
自然月 / 季度 / 年统计、峰谷计价、按模型与会话明细、CSV·JSON 导出、独立 CLI 报表。
本仓库派生自 [`dsh-token-meter-panel`](https://github.com/olimc2016/dsh-token-meter-panel) 0.6.7（MIT），
版本从 0.1.0 起算。**金额是本机估算，不是官方账单。**

## 文件地图（改之前先看这里，别整读大文件）

| 文件 | 职责 |
|---|---|
| `lib/index.js` | 宿主半侧：settings schema、webServer 路由（summary/balance/settings/export/health）、官方用量与余额取数、更新检查 |
| `src/client/index.js` | 浏览器半侧源码（`React.createElement`，无 JSX）；三视图 UI 全在这里 |
| `src/core.mjs` | 共享纯逻辑：会话日志聚合、计价、`dayModels`、日期键 |
| `src/zstd.mjs` | 多帧 zstd 解码（派生自 DSH，见 THIRD-PARTY-NOTICES） |
| `tools/report.mjs` | 独立 CLI 报表（零依赖，只读会话日志） |
| `tools/preview.mjs` | 真 bundle + `--demo` 合成数据 → HTML 预览（README 截图来源） |
| `tools/*.mjs` | 构建、模块链接、自检、预览 |
| `lib/client.js` | **构建产物，必须入库**（用户安装时不会现场构建） |

定位技巧：`grep -n "<关键字>" src/client/index.js`，然后只读 ±20 行；不要通读整份文件。

## 常用命令

```bash
export PATH="$HOME/.nvm/versions/node/v22.23.4/bin:$PATH"   # 本机 node 由 nvm 管理
npm install --cache /tmp/dsh-npm-cache                       # 依赖装到工作区；~/.npm 在沙箱外
npm run setup       # 链接 @deepseek-ai/*（来自 DSH profile）+ esbuild
npm run build       # 构建 lib/client.js（改 src/client/** 必须跑）
npm test            # 10 项自检（verify-* / smoke-* / report）
npm run report      # 人类可读 CLI 报表
node tools/preview.mjs --demo --view detail   # 合成数据预览（不启动浏览器）
```

## 守卫（这些做错会真的坏）

1. **构建失败必须硬失败**：改完先确认 `lib/client.js` 真的更新了（看 mtime / 大小），别让烟测测旧产物。
2. **改了判定逻辑必须反向验证**：故意破坏一次确认测试变红，再恢复；没验证过的测试不入库。
3. **产物与源码同一次提交**：`lib/client.js` + `.map` 必须和 `src/` 一起提交。
4. **宿主改动必须重启 DSH 才生效**；只改客户端也要重新 build（HMR 才会换 bundle）。
5. **公开仓库禁止出现**：账号、邮箱、token、本机路径、真实会话标题、余额截图。
   README 截图一律用 `tools/preview.mjs --demo` 生成。
6. **同一张表不许混口径**：官方金额与本地推算分开呈现；估算值必须标注「允许几分差异」。
7. **webServer 路由写在数组里**：每项结尾是 `}),` 不是 `});`（写错整文件语法错误）。
8. **官方接口鉴权别混**：账号会话用 `x-dsh-auth-token`，网页 token 用 `Authorization: Bearer`；
   用量窗口必须按北京零点对齐。
9. **依赖别装 `/tmp`**：esbuild 放仓库 `node_modules`，`npm run setup` 负责链接；npm cache 用 `/tmp`。
10. **发布不可逆**：npm 版本发出去撤不回；本仓库暂不走 npm，GitHub tag 也先在本机确认 `npm pack --dry-run`。

## token 预算（单次任务）

≤3 个文件、≤200 行改动；构建 + 全套测试 **1 次**；真机验证 **1 次**（攒批做）；外部调研 0~1 次。

## Agent skills

### Issue tracker

Issues live in the repo's GitHub Issues (`catgrandfa/dsh-token-cost`), managed with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: root `GLOSSARY.md` + `docs/adr/`. See `docs/agents/domain.md`.

## 权威文档

- 使用与安装：`README.md` / `README.en.md`
- 变更记录：`CHANGELOG.md`
- 第三方许可：`THIRD-PARTY-NOTICES.md`
- 上游参考（架构来源）：<https://github.com/olimc2016/dsh-token-meter-panel>
