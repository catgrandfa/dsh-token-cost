# dsh-token-cost

> DSH（DeepSeek Harness）的 **Token 花费面板**：今天花了多少钱、花在哪、缓存省了多少、预算还剩多少。
> 兼容 DSH 0.2.x，**零外部依赖**（自带多帧 zstd 解码，不需要 `zstd` / Homebrew）。

[English](README.en.md) | 中文

> 本插件是社区插件，并非 DeepSeek 官方插件；与深度求索（DeepSeek）无隶属、合作或背书关系。
> 面板金额是**本机估算**，不是官方账单；价格与计费规则以[官方定价页](https://api-docs.deepseek.com/zh-cn/quick_start/pricing)为准。

---

## 这是什么

本项目派生自社区插件 [`dsh-token-meter-panel`](https://github.com/olimc2016/dsh-token-meter-panel)（MIT，0.6.7），
保留其采集 / 计价 / 官方取数内核，**重做了面板 UI** 并新增了预算预测、月度预算、按模型明细、
CSV/JSON 导出与独立 CLI 报表；同时支持 **GLM（智谱）/ Kimi（月之暗面）** 等国产第三方模型，
按模型内置单价计价。

DSH 会把每次模型调用的 token 用量写进会话日志，但**只记 token、不算钱**。这个插件把用量翻译成钱：

- **今日消费**、近 7 天 / 近 30 天 / 本月花费与账户余额
- **预算进度**：每日预算 + 本月预算 + 按当前时段外推的「预计今日花费」
- **钱花在哪**：缓存命中输入 / 未命中输入 / 输出各自花了多少，以及按模型、按会话、按 provider 的排行
- **缓存省了多少**：DeepSeek 缓存命中价只有未命中的 1/50 ~ 1/30，这个数字通常很大
- **可带走**：面板一键导出 CSV / JSON；不启动 DSH 也能用 `node tools/report.mjs` 出报表

![总览](docs/preview-overview.png)

<table>
<tr>
<td width="50%"><img src="docs/preview-detail.png" alt="明细：按模型、按会话、搜索与占比"></td>
<td width="50%"><img src="docs/preview-export.png" alt="导出：CSV/JSON 下载、CLI 报表与 HTTP 接口"></td>
</tr>
<tr>
<td align="center"><sub>明细：按模型 / 按会话 / 按 provider</sub></td>
<td align="center"><sub>导出：面板下载 + CLI 报表 + HTTP 接口</sub></td>
</tr>
</table>

> 截图由 `node tools/preview.mjs --demo` 用**合成数据**渲染，不含任何真实会话、路径或余额。

---

## 功能

| 视图 | 内容 |
|---|---|
| **总览** | 今日消费（官方 / 官方+第三方口径标注）、较昨日、当日预测、每日 / 本月预算进度、余额、近 7/30 天与**本月 / 本季度 / 本年**金额、渠道拆分（官方：账号额度 / API Key，第三方）、token 四宫格、命中率、单次花费、峰谷价表、30 天**折线趋势**、24 小时分时、本会话实时 |
| **明细** | 今日 / 近 7 天 / 近 30 天 / 本月 / 本季度 / 本年切换；按模型（含 GLM / Kimi）消费与占比、按会话明细（可搜索、子代理打标）、按 provider 汇总、今日成本构成、**按天历史** |
| **导出** | 按天 / 按会话 / 按模型 × 今日 / 7 天 / 30 天 / 本月 / 季度 / 年 / 全部 × CSV / JSON，一键下载；附 CLI 与 HTTP 接口示例 |

其他能力：

- **GLM / Kimi 支持**：默认统计 pi-ai 等第三方路由；按 model id 匹配 GLM（智谱）与 Kimi（月之暗面）官方单价，未内置的模型只记 token 不猜价
- **无预算模式**：预算默认 `0`，只记录花费、不告警、不显示进度条；想控预算时点一下设置
- **侧栏今日花费预览**：侧栏入口直接显示 `Token · ¥9.87`（展开态文本 + 折叠态 tooltip）
- **峰 / 谷分档计价**：高峰（北京时间工作日 9:00–12:00、14:00–18:00）与空闲档分别记账再汇总
- **官方对账**：可选接入 DeepSeek 账号会话或 `platform.deepseek.com` 网页登录态，按天金额与平台用量页同源
- **余额**：桌面端账号登录或 `DEEPSEEK_API_KEY` 双路；账号路径还能读累计消费
- **面板内改设置**：预算 / 低余额阈值点一下就能改，写回 DSH 设置
- **皮肤**：`default`（跟随 DSH 主题）/ `glass`（液态玻璃）
- **零配置出数**：不需要 API Key、不需要外部解压工具；装好重启 DSH 即可

---

## 安装

### 方式一：GitHub 直装（推荐，固定版本）

```bash
dsh plugin --profile desktop add github:catgrandfa/dsh-token-cost#v0.3.5
```

`web` profile 同理，把 `--profile desktop` 换成 `--profile web`。

### 方式二：一键脚本

**macOS / Linux**

```bash
curl -fsSL https://raw.githubusercontent.com/catgrandfa/dsh-token-cost/main/install.sh | bash
```

**Windows（PowerShell）**

```powershell
powershell -ExecutionPolicy Bypass -Command "iwr -UseBasicParsing https://raw.githubusercontent.com/catgrandfa/dsh-token-cost/main/install.ps1 | iex"
```

### 方式三：从源码（开发者）

```bash
git clone https://github.com/catgrandfa/dsh-token-cost.git
cd dsh-token-cost
npm install --cache /tmp/dsh-npm-cache
npm run setup     # 链接 DSH 本体里的 @deepseek-ai/* 与 esbuild（仅开发需要）
npm test
dsh plugin --profile desktop add .
```

> 装完**必须完全退出并重启 DSH**：插件 bundle 只在宿主启动时解析。
> 重启后侧栏最下方出现「Token」入口，点开就是面板。

**与上游插件共存**：本插件的包名、路由前缀（`/token-cost`）、设置命名空间（`token-cost`）、
侧栏 slot id（`tokencost`）全部独立，可以和 `dsh-token-meter-panel` 同时安装、互不冲突。

---

## 计费口径

按 **DeepSeek 官方定价**折算人民币（CNY），**不是** DSH 内置能力：

- 现售模型：`deepseek-flash`、`deepseek-v4-pro`
  （`deepseek-chat` / `deepseek-reasoner` 已下线；旧的 `deepseek-v4-flash` 名称仍可用，按 Flash 价计费）
- **分高峰 / 空闲两档，空闲价 = 高峰价的一半**
- 高峰 = 北京时间周一至周五 9:00–12:00、14:00–18:00（本插件不识别法定节假日）
- `reasoningTokens` 已包含在 `outputTokens` 内，不重复计价
- **未知模型不猜价**：只累加 token，不计金额
- 价格来源：<https://api-docs.deepseek.com/zh-cn/quick_start/pricing>（内置价采集于 2026-09-19）

### 第三方模型（GLM / Kimi）

DSH 通过 pi-ai 等适配器接入的第三方路由，provider 名可以是任意值；插件按 **model id** 查内置价，
provider 名不参与定价：

| 系列 | 模型 | 输入 / 缓存命中 / 输出（元/百万 token） | 来源 |
|---|---|---|---|
| GLM | `glm-5.3`、`glm-5.2` | 8 / 2 / 28 | [智谱定价](https://open.bigmodel.cn/pricing)（2026-10-28） |
| GLM | `glm-5.1`（基础档） | 6 / 1.3 / 24 | 同上 |
| GLM | `glm-5.3-flash` | 0.8 / 0.23 / 2.8 | 同上 |
| GLM | `glm-5.3-flashx` | 2 / 0.57 / 7 | 同上 |
| GLM | `glm-4.7-flash` | 免费 | 同上 |
| Kimi | `kimi-k3.1-pro` | 13 / 1.3 / 68（缓存写入 13） | [Kimi 定价](https://platform.kimi.com/docs/pricing/chat)（2026-10-28） |
| Kimi | `kimi-k3` | 20 / 2 / 100（缓存写入 20） | 同上 |
| Kimi | `kimi-k3.1-pro-highspeed` | 26 / 1.3 / 136 | 同上 |
| Kimi | `kimi-k2.7-code` / `kimi-k2.6` | 6.5 / 1.3~1.1 / 27 | 同上 |

- 长上下文阶梯价、限时折扣、套餐价**无法从聚合 token 还原**，内置值取标准档基础价
- 未内置的第三方模型：只记 token、不计金额（`unpricedCalls` 会显示数量）
- 模型名大小写、`provider/model` 前缀写法会自动归一化
- 第三方**余额 / 套餐额度**暂未接入，余额卡仍只查 DeepSeek

### 自定义渠道单价（可选）

同一个模型可能走不同渠道、单价不同（例如 DeepSeek 模型经由第三方中转）。可以给「渠道 × 模型」
单独定价，命中后按固定价估算（元/百万 token，**不分峰谷**）：

```json
{
  "channelRates": {
    "<provider 名>": {
      "<模型名或归一化键或 *>": { "cacheHit": 1, "cacheMiss": 2, "output": 3, "cacheWrite": 0 }
    },
    "*": { "*": { "cacheHit": 0.5, "cacheMiss": 1, "output": 2 } }
  }
}
```

- provider、模型都支持 `*` 兜底；命中渠道价后优先于内置 / 官方价
- 字段不全（缺 `cacheHit` / `cacheMiss` / `output`）视为未配置，自动回落内置费率
- 写在 profile 的配置 patch 里（`$DSH_HOME/profiles/<profile>/cordis.patch.yml`，给 `token-cost`
  行加 `config.channelRates`），重启 DSH 生效
- 面板概览的「渠道拆分」按渠道分开显示今日 / 近 30 天花费：官方拆成 **账号额度**（账号登录）与
  **API Key**（走 API Key 不占账号额度）两行，各第三方渠道各占一行

费率、每日预算、月度预算、告警阈值、刷新间隔、是否显示余额，都可以在
**设置 → 插件 → token-cost** 里改；改完立刻生效。

**预算默认是 `0`（只记录花费）**：不显示进度条、不告警；把每日 / 本月预算设成大于 0 的数，
才会出现预算进度、告警线与超支提示。侧栏入口会同时显示今日花费（`Token · ¥x.xx`）。

**统计范围默认包含第三方 provider**（GLM / Kimi 等）；只想看 DeepSeek 时把
`officialOnly` 打开，或 CLI 加 `--official-only`。

---

## 数据从哪来

1. **本地日志聚合**（按天 / 按会话 / 按模型的唯一来源）
   扫描 `$DSH_HOME/sessions/<工作区>/<会话>/session[.vN].jsonl[.zstd]`，
   取每条 `assistant/message` 的 `data.usage`，按北京时间分桶。`.jsonl.zstd` 是追加写入的
   多帧 zstd，插件用纯 JS 按帧边界解码（`src/zstd.mjs`），因此不需要系统装 `zstd`。
2. **官方用量**（可选，按天金额优先来源）
   桌面端已登录时走 DSH 账号会话（`x-dsh-auth-token`，免网页登录）；否则尝试读取浏览器里
   `platform.deepseek.com` 的 `userToken`。数据与平台「用量」页同源。
3. **第三方 provider（GLM / Kimi 等）**：来自本地日志；有内置单价就计价，否则只记 token
4. **余额 / 累计消费**：账号服务或 `api.deepseek.com/user/balance`（仅 DeepSeek）。

官方用量只覆盖 DeepSeek 最近 30 天，插件会把官方 DeepSeek 用量与本地第三方用量**按天合并**；
角标显示「官方 + 第三方」，明细里仍能按 provider / 模型拆开；官方渠道的两种走法
   （账号登录 = 账号额度、API Key = 不占账号额度）在渠道拆分里分开统计。

### 已知盲区

- 会话标题生成、联网搜索这两类调用**不落 usage**，无法计入花费
- 活跃会话仍在追加写入，所以「今日」是**下界**（面板底部有标注）
- **自然月 / 季度 / 年按本地日志统计**：官方用量接口只返回最近 30 天；统计窗口默认 365 天，
  首次扫描可能分段补齐（面板底部会显示「正在补扫」）
- 本地金额与官方账单允许几分差异；对账请以官方账单页为准
- GLM / Kimi 的阶梯价 / 折扣 / 套餐无法恢复，第三方余额也未接入

---

## 导出与 CLI

### 面板导出

「导出」视图选择 **数据 × 范围 × 格式** 后点下载。导出内容只有 token 数、金额、调用次数、
会话标题 / 工作区等聚合字段，**不含对话正文、文件路径或凭据**。

HTTP 接口（与面板同源，需要 DSH 登录态）：

```bash
GET /token-cost/export?dataset=daily&scope=7d&format=csv
GET /token-cost/export?dataset=sessions&scope=month&format=json
GET /token-cost/export?dataset=models&scope=year&format=csv
```

### 命令行报表

不启动 DSH 也能用（只依赖 Node 内置模块）：

```bash
node tools/report.mjs --days 7 --top 5        # 人类可读：汇总 + 每日 + 模型 + 会话
node tools/report.mjs --json                  # 机器可读 JSON
node tools/report.mjs --csv daily             # daily | sessions | models
node tools/report.mjs --budget 5              # 今日预算使用率
node tools/report.mjs --official-only         # 只看 DeepSeek 官方 provider
node tools/report.mjs --sessions-root ~/.dsh/sessions
```

---

## 隐私与权限

先给结论：**只读本机会话日志；不执行命令；不写业务文件；凭据只在宿主进程内存中使用。**

| 权限 | 实际情况 |
|---|---|
| 文件（读） | 只读 `$DSH_HOME/sessions/**/session[.vN].jsonl[.zstd]` |
| 文件（写） | 无（导出由浏览器下载，聚合只在内存） |
| 网络 | ① 官方用量 / 余额（可在设置里关）；② 版本检查（GitHub Releases，可关自动更新） |
| 命令执行 | 无（唯一 spawn 是「后台自动更新」调用 `dsh plugin add`，默认开启但只在本插件运行 60s 后、发现新版本时执行一次；可在设置里关） |
| 凭据 | 仅按引用名（`DEEPSEEK_API_KEY` / `DEEPSEEK_PLATFORM_TOKEN`）向 DSH 凭据服务取值，不下发到浏览器、不写日志、不进文件 |

浏览器登录态读取（可选）：只把 Chromium 系浏览器的 `Local Storage/leveldb` **复制到系统临时目录**再解析，
解析完立即删除；只取 `platform.deepseek.com` 这一条记录，不外发、不落盘。

---

## 兼容性与限制

- DSH 0.2.x（0.2.0-rc.2 实测）；Node ≥ 22.19
- 平台：macOS 实测；Windows / Linux 由 CI 自检覆盖
- 金额为估算，不能替代官方账单
- 暂无 npm 发行；安装走 GitHub（源码或 Release tarball）

---

## 开发

```bash
npm install --cache /tmp/dsh-npm-cache
npm run setup          # 链接 @deepseek-ai/* 与 esbuild
npm run build          # 构建 lib/client.js（改 src/client/** 后必须执行）
npm test               # verify-* / smoke-* / report 全套自检
node tools/preview.mjs --demo --view overview   # 合成数据预览（不改真实日志）
node tools/preview.mjs --open                   # 真数据预览，直接开浏览器
```

产物 `lib/client.js` 需要入库；宿主半侧改动必须重启 DSH 才生效。

目录结构：

```
├── package.json          # dsh.bundle.patch（宿主层）+ dsh.client（浏览器层）
├── cordis.patch.yml      # 把宿主半侧插进 profile 层栈
├── lib/index.js          # 宿主半侧：路由、设置、官方用量 / 余额、更新检查
├── lib/client.js         # 浏览器半侧（esbuild 产物，勿手改）
├── src/core.mjs          # 采集内核：扫描 / 聚合 / 计价 / dayModels
├── src/zstd.mjs          # 多帧 zstd 解码
├── src/client/index.js   # 三视图面板源码（改这个）
├── tools/report.mjs      # 独立 CLI 报表
├── tools/preview.mjs     # 预览 / 截图（--demo 合成数据）
├── docs/                 # 截图
└── THIRD-PARTY-NOTICES.md
```

---

## 许可

本项目以 **MIT** 许可证发布，见 [LICENSE](LICENSE)。

它派生自 [`dsh-token-meter-panel`](https://github.com/olimc2016/dsh-token-meter-panel)
（MIT，`Copyright (c) 2026 oli20`）；`src/zstd.mjs` 的帧扫描逻辑改写自 DSH 的
`@deepseek-ai/dsh-session-persistence-jsonl`（MIT，`Copyright (c) 2026 DeepSeek`）。
完整声明见 [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md)。

## 致谢

- 上游作者 [oli20](https://github.com/olimc2016)：采集内核、计费口径、官方取数与工程实践
- DeepSeek Harness 团队：插件机制、会话日志格式与多帧 zstd 实现
