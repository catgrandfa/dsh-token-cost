# 变更记录

本项目是 [`dsh-token-meter-panel`](https://github.com/olimc2016/dsh-token-meter-panel) 的
衍生插件（fork），从上游 **0.6.7** 的 MIT 源码出发，重做面板 UI 并新增能力；
版本号从 `0.1.0` 独立起算，与上游版本号不一一对应。

## 0.2.0 — 无预算模式、自然季度 / 年、侧栏花费预览

### 新增

- **无预算模式（只记录花费）**：`dailyBudget` / `monthlyBudget` 默认 `0`；预算为 0 时不显示进度条、
  不告警，面板只记录今日花费与预测。点预算行即可随时设置预算。
- **侧栏今日花费预览**：侧栏入口标题从 `Token` 变成 `Token · ¥9.87`（展开态与折叠 tooltip 都可见）。
  数据优先复用已打开面板的缓存；面板未打开时，插件运行 45 秒后每 2 分钟轻量拉一次 `/summary`，
  不会和 DSH 启动抢资源。
- **自然季度 / 自然年统计**：总览新增「本季度」「本年」金额；明细视图与导出范围同步支持
  `month / quarter / year`。宽窗口按本地日志统计（官方用量接口只返回最近 30 天），面板内有口径标注。
- **统计窗口默认 365 天**：为了自然年统计能读到 1 月 1 日；首次扫描可能分段补齐，之后走增量缓存。
- **导出范围扩展**：`GET /token-cost/export?scope=month|quarter|year`，CSV / JSON 同面板。

### 验证

- 渲染门禁覆盖 `总览 / 明细 / 导出` 三个视图 + 无预算分支（一次遍历 810 个节点）。
- 宿主烟测覆盖新 scope 导出、monthlyBudget 写回；CI 在 Ubuntu / Windows 上通过。

## 0.1.0 — 首个开源版本

### 新增（相对上游 0.6.7）

- **三视图面板**：侧栏 / 中栏面板拆成 `总览 / 明细 / 导出` 三个视图，重新排布信息层级。
- **月度预算**：新增 `monthlyBudget` 设置；总览显示本月已用 / 预算与进度条。
- **今日预测**：按当日已过时间线性外推「预计今日花费」，超预算时转红。
- **按模型 / 按 provider 明细**：采集内核新增 `dayModels`（`日期 | provider | model`）聚合，
  明细视图可按「今日 / 近 7 天 / 近 30 天」筛选模型消费；会话明细支持搜索。
- **CSV / JSON 导出**：面板内一键下载，也提供 `GET /token-cost/export` 路由
  （`dataset=daily|sessions|models` × `scope=today|7d|30d|all`）。
- **命令行报表**：[`tools/report.mjs`](tools/report.mjs) 零依赖读取本机会话日志，
  支持人类可读表格、`--json`、`--csv`、`--budget`、`--top`、`--sessions-root`。
- **演示数据预览**：[`tools/preview.mjs`](tools/preview.mjs) 新增 `--demo` 与 `--view`，
  用合成数据渲染三个视图，README 截图不含任何真实会话 / 路径 / 余额。
- **自检**：新增 `tools/verify-report.mjs`、导出路由与 monthlyBudget 的宿主烟测、
  客户端新增文案的渲染门禁。

### 变更

- 包名、插件名、webServer 路由前缀（`/token-cost`）、设置命名空间（`token-cost`）、
  侧栏 slot id（`tokencost`）全部独立，**可与上游插件同时安装**。
- 后台自动更新改为指向本仓库 Releases（`github:catgrandfa/dsh-token-cost#vX`）。
- 移除上游的「孪生包」发布机制（`dsh-token-mb`）、npm 发布工作流与三角色版本号逻辑；
  本仓库只以 GitHub 源码 / Release 分发。
- README、AGENTS、许可证与第三方声明按衍生项目重写，保留上游 MIT 版权声明。

### 继承自上游（未改变）

- 多帧 zstd 会话日志解码、按北京时间分桶、峰 / 谷两档计价、增量文件缓存与扫描时间预算。
- 官方用量（DeepSeek 账号会话 / 浏览器登录态）与余额（账号服务 / API Key 双路）取数。
- 面板内改预算 / 低余额阈值、皮肤（default / glass）、自动刷新、版本更新检查。
- 计价口径与已知盲区：金额为本机估算，不是官方账单；未知模型只记 token 不计费。

### 已知限制

- 仅供估算，不能替代官方账单；官方接口或费率变更可能使数字变化，以官方页面为准。
- 会话 / 模型明细以本地日志为准；按天金额在官方用量可用时优先采用官方数据。
- 暂无 npm 发行；安装走 GitHub（见 README）。
