# DSH 插件「被收录」机制研究

> 结论基于 2026-10-28 的实机与环境：本机 DSH 桌面版 2.0.20-next 内置的 `@deepseek-ai/dsh-plugin-market`
> 与 `@deepseek-ai/dsh-plugin-market-index` 源码，以及社区事实标准仓库
> [awesome-dsh-plugin/awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)。
> 文中链接是可复核的一手来源。

## 一句话结论

**DSH 官方没有「插件收录 / 审核 / 官方市场」这回事**：插件市场是空的，用户必须自己添加索引源 URL
（`indexes` 默认 `[]`，没有配置就不发任何请求）。所以「被收录」= 被**社区索引/目录**收录。事实标准是
[awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)（7406 条，PR 一个 YAML 即可），
它同时喂给 `dsh-plugin-catalog`（npm，每日自动发布）、[dsh-market](https://github.com/dsh-market/dsh-market)
应用内市场，以及 realguan 的 format 1 索引镜像。
此外还有三家按 GitHub 自动发现的目录（dshfind / 1024Store / dsh-plugin-mall），加 topic 就能进，不用 PR。

三条关键分叉：

| 目标 | 前提 | 说明 |
|---|---|---|
| 插件页 / README / dsh-market 应用内列表 | **只发 GitHub 也行** | 7406 条里 3583 条没有 npm 包，照样收录 |
| 进 awesome 官方 format 1 索引（`dsh-plugin-catalog`） | **必须发 npm** | 生成脚本只收「有 npm 包 + 精确版本 + 发布时间」的条目；git 条目因缺 commit SHA 被明确排除 |
| 进 realguan 的 format 1 索引（另一条发现页索引源） | 先被 awesome 收录即可 | 它从 awesome 的 `plugins.json` 反查回源逐条生成，支持 git 条目（6988 条里 2114 条 git） |

## 一、市场是怎么工作的（本机源码为准）

证据：`app.asar` 内 `@deepseek-ai/dsh-plugin-market`、`@deepseek-ai/dsh-plugin-market-index`、
`@deepseek-ai/dsh-client-ui-plugin-market` 三个包的 README 与实际代码。

- **索引源由用户配置**：`indexes` 默认 `[]`，Host 不请求任何地址；用户在「插件 → 发现 → 索引源」里粘贴 URL。
  读取失败/无索引时的空状态、添加或删除索引源、切换市场，都在客户端里。
- **索引格式固定为 format 1**，由 `@deepseek-ai/dsh-plugin-market-index` 严格校验，每个条目需要：
  - `name`（npm 包名风格）、`title`、`description`（`en` 必须有）、`icon`、`homepage`、`repository`；
  - `versions[]`：每条含**精确 SemVer** `version`、`publishTimestamp`（Unix 秒）、
    `source`（`{type:"npm"}` 或 `{type:"git", url, commit:40 位 SHA, path?}`）、`engines.dsh`（SemVer range）；
  - `metadata.category / labels / sortKeys`（必须在索引头部声明过才能引用）。
- **安装参数由 source 决定**：npm → `name@version`（可带 registry）；git → `git+<url>.git#<commit>`（子目录再加 `&path:/...`）。
  format 1 的 git 条目必须钉死 commit，不能写 tag/branch。
- **兼容性**按每个版本的 `engines.dsh` 与当前 DSH 版本比对；没有兼容版本的条目标「无法安装」。

「只发 GitHub」进不了 **awesome 官方索引**的技术原因很明确：
[`build-index.mjs`](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/blob/main/scripts/build-index.mjs)
写明 *"Entries it cannot express — no npm package, no version, or no publish time yet — are counted and left out"*；
[`lib/market-index.mjs`](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/blob/main/scripts/lib/market-index.mjs)
更直接：*"The GitHub-only half of the list cannot be expressed yet — format 1 wants a commit SHA per Git version,
and this repository records none."*

当前 awesome 官方索引实测：3823 个插件（全部 npm 发布），约 3 MB，地址
`https://cdn.jsdelivr.net/npm/dsh-plugin-catalog/index.json`。

## 二、主渠道：awesome-dsh-plugin 的收录流程

官方贡献指南：[contributing.md](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/blob/main/contributing.md)。

1. **一个 PR 只加一个文件**：`data/plugins/<owner>__<repo>.yml`。两个 README 由脚本生成，**不要手改**。
   ```yaml
   url: https://github.com/catgrandfa/dsh-token-cost   # 必须与仓库完全一致
   name: catgrandfa/dsh-token-cost                     # 列表里显示的链接文字
   category: usage
   description:
     en: One-line description ending with a period.
     zh: 一句话描述，以句号结尾。                      # 可选，维护者会补
   # icon / tarball 见下
   ```
   只有 `description.en` 必填；含 `: `（冒号空格）必须加引号。
2. **硬性要求**：
   - `package.json` 声明 `dsh.bundle`（只有 `dsh.client` 会被 CI 打回——最常见被拒原因）；
   - 仓库有真实可用代码，且**创建满 1 天**（CI 用 `created_at` 算，`MIN_AGE_DAYS = 1`）；
   - 仓库添加 **`dsh-plugin` GitHub topic**；
   - 描述只讲功能、不带营销词，且**必须与代码一致**（评审会对着源码核数字、核命令名）；
   - 分类选最贴合的（选不准维护者会改，不会打回）；纯聚合包（只写依赖的 meta-package）不收；
   - 一个 PR 最多 3 条。
3. **评审**：CI 绿只是前置条件；维护者会实际读目标仓库。与已有条目重复时「先来者保留位置」只是平局规则，
   **更好的 fork 或确有新东西的可以收录**。收录不是永久的：仓库消失/归档/长期停更会被扫描并移除。
4. **npm 可选**：*"Nothing here depends on it — listing is unaffected either way"*。
   发 npm 只多两件事：市场显示下载量并按下载量排序；以及进 awesome 的 format 1 索引。
   npm 映射靠已发布包的 `repository` 字段指回被收录仓库自动采集，条目里不能手写 `npm:`。
5. **不发 npm 的话**：把预构建 tarball 挂到 GitHub Release，用 `tarball:` 字段指过去；
   源码装不动的仓库**必须**这么做，否则市场只展示源码构建命令。
6. **可选加分项**：`icon:`（GitHub 托管位图，约 96px）；在自己仓库 `package.json` 旁放 `screenshots.json`
   （1–8 张相对路径），市场详情页按 App Store 风格展示，改图推自己仓库即可生效。

发布链路：PR 合并后 GitHub Actions 在 `main` 上重建 README / 站点 / `plugins.json` / `index.json`，
再把 catalog 以 `YYYY.MDD.RUN` 版本发布到 npm 包 `dsh-plugin-catalog`（用户拿到的是每日快照）。
`dsh-market`（`dsh plugin --profile web add dshmarket`）内置这份列表，几个第三方客户端也内置它。

## 三、本仓库现状对照（2026-10-29 09:05 CST）

| 要求 | 现状 | 能过吗 |
|---|---|---|
| `dsh.bundle` manifest | `package.json` 有 `dsh.bundle.patch: ./cordis.patch.yml` | ✅ |
| `cordis.patch.yml` | 有，row id `token-cost`（避开了内核的 `token-meter`） | ✅ |
| 真实可用代码 + 能从 GitHub 安装 | desktop profile 已按 `github:catgrandfa/dsh-token-cost#v0.3.2` 安装成功；当前版本 0.3.7 | ✅ |
| 仓库创建满 1 天 | 创建于 2026-10-28 09:03 UTC；**10-29 09:03 UTC（北京时间 17:03）后**才达标 | ⏳ |
| `dsh-plugin` topic | 已有 9 个 topic，含硬要求 `dsh-plugin` 与相关性 topic（2026-10-28 18:20 设置并 API 复核） | ✅ |
| 分类 | `usage`（该分类已有 392 条，约 125 条与 token/花费相关，其中同名 `dsh-token-cost` 已有 2 个别人的仓库） | ✅ 但描述要写清差异 |
| 描述属实 | README 已如实写明派生自 `dsh-token-meter-panel`，并列出新增项 | ✅ 写条目时照实写 |
| 预构建 tarball | ✅ `v0.3.7` Release 已挂 `dsh-token-cost.tgz`（735 KB，由 `.github/workflows/release-tarball.yml` 生成），URL 不带版本号、钉 tag | ✅ |
| `screenshots.json` | ✅ 已加，三张 `docs/preview-*.png`（overview / detail / export），并进了 npm 包的 `files` | ✅ |
| npm 包 | 未发布；且 npm 上 `dsh-token-cost` **已被别人占用**（2026-08-13 起） | ⚠️ 要发只能发 scope 包 |
| GitHub star | 1（所有者自己 star，2026-10-28 已确认 `stargazerCount:1`）；`@1e0zj/dsh-plugin-mall` 一类工具设了 `stars:>=1` 的搜索下限 | ✅ 够过门槛，但排序仍垫底 |

参照：上游 `olimc2016/dsh-token-meter-panel` 在列表里版本 0.6.4、下载量 1038、tarball 指向 GitHub Release，
同时出现在 awesome 的 format 1 索引里。

## 四、其他分发渠道（自动发现类）

| 渠道 | 是什么 | 收录机制 | 只发 GitHub 可行吗 | 证据 |
|---|---|---|---|---|
| [dshfind](https://api.dshfind.com/market/v1/plugins)（18243 条） | 社区目录，同时是桌面市场的 catalog source | **自动**：每天 02:17 UTC 同步 GitHub `topic:dsh-plugin`，无需 PR/issue | ✅ 最顺；纯 git 条目 `install.kind=git` | [README](https://raw.githubusercontent.com/hikariming/dshfind/main/README.md) |
| [1024Store](https://deepseek1024.com/api/v2/plugins)（13892 条） | 站点 + 公开 API | topic 扫描自动收录；也可 PR 到 [awesome-deepseek-harness-plugins](https://github.com/imsai-sh/awesome-deepseek-harness-plugins) 的 `catalog/plugins/*.json` 自动合并 | ✅ 可被收录/搜索，但商店只给 npm 安装按钮，无 npm = 只能浏览 | [plugin-discovery.md](https://raw.githubusercontent.com/imsai-sh/awesome-deepseek-harness-plugins/main/docs/plugin-discovery.md) |
| [@1e0zj/dsh-plugin-mall](https://github.com/1e0zj/dsh-plugin-mall) | DSH 内插件市场 | 客户端实时搜 GitHub `topic:dsh-plugin`，逐仓库验 `dsh.bundle` 打「已验证」徽章 | ✅ 但搜索带 `stars:>=1` 下限 | [README](https://raw.githubusercontent.com/1e0zj/dsh-plugin-mall/main/README.md) |
| [realguan/dsh-plugin-market](https://github.com/realguan/dsh-plugin-market) 的 format 1 索引 | awesome 数据的镜像索引（6988 条，2114 条 git） | 无自有投稿：每天 03:17 UTC 从 `awesome-dsh-plugin.com/plugins.json` 反查回源重建，git 条目钉默认分支 HEAD | ✅ 但要先被 awesome 收录；jsDelivr 最多再滞后 12h | [TOOLING.md](https://raw.githubusercontent.com/realguan/dsh-plugin-market/main/TOOLING.md) |

没有一家用 npm keyword 做发现（`keywords:dsh-plugin` 搜出 1 万+ 噪音），npm 只影响安装方式、下载量排序和
awesome 官方索引的收录资格。

## 五、行动清单

**现在就能做（10 分钟，无需审核）**

1. ✅ **已完成 2026-10-28 18:12**：仓库 topic 现在是 `dsh-plugin`、`deepseek-harness`、`dsh`
   （`GET /repos/catgrandfa/dsh-token-cost` 已确认生效）。加完 dshfind 次日 02:17 UTC 自动收录，
   1024Store/mall 也会扫到；GitHub 搜索索引对 topic 变更通常有几分钟到几小时延迟。
2. ✅ **已完成 2026-10-28 19:2x**：`screenshots.json` 已加（三张 demo 预览图，路径相对该文件），
   同时写进 `package.json` 的 `files`；提交 `chore: 收录准备 — screenshots.json 与 Release tarball 工作流`。
3. ✅ **已完成 2026-10-29 01:02 UTC**：新增 `.github/workflows/release-tarball.yml`（手动触发），
   已为 `v0.3.7` 生成 Release 并挂上 `dsh-token-cost.tgz`：
   `https://github.com/catgrandfa/dsh-token-cost/releases/download/v0.3.7/dsh-token-cost.tgz`
   资产名不带版本号、URL 钉 tag，所以以后发版不会 404；新版本换个 tag 再跑一次工作流即可。
4. 确认 README 首段那句话能被直接当作 `description.en` 核验（功能、数字、命令都要真实）。
5. 让仓库至少有 1 个 star：GitHub 允许所有者 star 自己的仓库，且这个 star 与别人的一样计入
   `stargazers_count`，所以自己 star 能过 `@1e0zj/dsh-plugin-mall` 的 `stars:>=1` 机械门槛
   （见其 `src/github.js` 的 `searchPlugins`，`minStars` 默认 1，查询拼成 `topic:dsh-plugin stars:>=1`）。
   但它只解决「搜得到」，不解决「排得前」——该工具按 star 降序，1 星仍然垫底；awesome 的收录评审
   不看 star 门槛，所以自 star 不影响能否被收录。真正卡人的是 topic，没有 topic 时 star 数完全不起作用。

**2026-10-29 17:03（北京时间）之后**

6. 提 PR：只加 `data/plugins/catgrandfa__dsh-token-cost.yml`（草稿见下节），category `usage`，
   中英描述如实写明与上游的差异（预算/月度预算、GLM/Kimi 按模型计价、季度/年统计、CSV/JSON 导出、CLI 报表）。
   预构建 tarball 已经就绪，条目里直接带上 `tarball:`。
7. 同日可选：PR 到 `imsai-sh/awesome-deepseek-harness-plugins` 的 `catalog/plugins/*.json`，
   自动合并后 1024Store 里会从 `unclassified` 升级成有分类、有双语描述的条目。
8. 跟进：要求修改时维护者会打 `held: author`，在同一分支推修复 + 留一条评论即可；不要手工改 README。

**想进 awesome 官方「发现」索引（可选，取决于是否愿意发 npm）**

9. 以 scope 名发布（裸名 `dsh-token-cost` 已被占用）：`@catgrandfa/dsh-token-cost`；
   `repository` 字段指回本仓库，列表会自动把 npm 包关联到条目；
   同时把 `package.json` 包名与 `cordis.patch.yml` 里 patch 的 `name` 改成新包名（否则 profile 里解析不到）。
10. 发布后等下一次 catalog 构建，条目会以 npm 版本进 `index.json`，发现页即可安装。
    不打算发 npm 也无妨：dsh-market、站点、dshfind、realguan 索引都能覆盖到。

## 六、可提交的条目草稿

文件路径 `data/plugins/catgrandfa__dsh-token-cost.yml`（描述按 README 现有功能如实写，提交前再核一遍数字）：

```yaml
url: https://github.com/catgrandfa/dsh-token-cost
name: catgrandfa/dsh-token-cost
category: usage
description:
  en: "Token spend panel for DeepSeek Harness: today and 7/30-day totals, natural month/quarter/year sums, cost split by cache-hit input, cache-miss input and output, per-model and per-session detail, daily and monthly budgets with a projected day-end spend, peak/off-peak pricing, CSV and JSON export, and a zero-dependency CLI report. Also prices GLM (Zhipu) and Kimi models shipped through third-party routes."
  zh: "DSH 的 Token 花费面板：今日与近 7/30 天、自然月/季/年合计，按缓存命中输入、未命中输入与输出拆成本，按模型/会话明细，每日与月度预算加当日花费外推，峰谷分档计价，CSV/JSON 导出，另有零依赖 CLI 报表；同时按模型单价计 GLM（智谱）与 Kimi 等第三方路由。"
# Release 预构建包已就绪；钉 tag + 不带版本号的文件名，下次发版不会 404
tarball: https://github.com/catgrandfa/dsh-token-cost/releases/download/v0.3.7/dsh-token-cost.tgz
```

`description.en` 含 `: ` 会破坏 YAML，所以整段加了引号；提交前在 awesome 仓库里 `npm ci` 后跑
`node scripts/generate-readme.mjs` 预览列表行。

## 七、不要做 / 风险

- **不要手改 README 或一次 PR 塞多条**：CI 会拒（≤3 条），手改 README 是历史上 PR 冲突的主要来源。
- **不要夸大描述**：最常见的被打回原因，而且会被对着代码核。
- **收录 ≠ 安全审计**：列表自己这么写；仓库消失、行为不端、长期停更会被移除。
- **名称冲突**：npm 上 `dsh-token-cost` 属于别人，用户若 `dsh plugin add dsh-token-cost` 会装到另一个插件；
  发 npm 必须用 scope，README 的安装命令也应改成对应渠道的写法。
- **不保证收录**：同类已有 100+ 条，条目人工评审；被拒不是对插件质量的判决（名单自己也这么声明）。

## 八、执行记录

- 2026-10-28 18:12 CST：用已登录的 Chrome 打开仓库页 →「Edit repository metadata」→ 设置 topics
  为 `dsh-plugin`、`deepseek-harness`、`dsh` → Save changes；API 复核 `topics` 已生效。
- 2026-10-28 18:12 CST：仓库已有 1 个 star（所有者自己 star），满足 `stars:>=1` 类门槛。
- 2026-10-28 18:20 CST：补相关性 topics，最终 9 个：`dsh-plugin`、`deepseek-harness`、`dsh`、
  `token-cost`、`token-usage`、`cost-tracking`、`llm-cost`、`deepseek`、`budget`。
  选择依据是 GitHub 上这些 topic 已有真实仓库沉淀（token-usage 1866、cost-tracking 1203、llm-cost 379、
  deepseek 14615、budget 1675），而 `csv`/`cli`/`dashboard` 这类太泛的没加，避免把 topic 做成关键词堆砌。
  **真正影响收录的仍然只有 `dsh-plugin`**：dshfind / 1024Store / mall 都只按这一个 topic 过滤。
- 2026-10-28 19:23 CST：提交 `0603c43` 加 `screenshots.json`（并进 `package.json` 的 `files`）与
  `.github/workflows/release-tarball.yml`；`5af7c77` 提交本笔记；已 push 到 `main`。
- 2026-10-29 01:02 UTC：手动触发 `release-tarball` 工作流，30 秒内成功，`v0.3.7` Release 出现资产
  `dsh-token-cost.tgz`（735,708 B）；同时 `test` 工作流在 push 后双平台跑过。
- 待办：只剩仓库满 1 天（2026-10-29 09:03 UTC / 北京 17:03）后的 awesome 单文件 PR。
