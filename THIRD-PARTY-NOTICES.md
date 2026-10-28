# Third-party notices / 第三方许可声明

本项目以 MIT 许可证发布（见 [LICENSE](LICENSE)）。它包含、改写或派生自下列第三方代码；
**每个项目仍适用其自身的许可证，本文件不改变这些条款。**

This project is distributed under the MIT license (see [LICENSE](LICENSE)). It contains,
adapts or is derived from the third-party code listed below. **Each project remains under
its own license; nothing in this file changes those terms.**

---

## 1. `dsh-token-meter-panel`（本项目 fork 的上游）

| 项 | 值 |
|---|---|
| 上游项目 | dsh-token-meter-panel / dsh-token-mb |
| 上游仓库 | <https://github.com/olimc2016/dsh-token-meter-panel> |
| 上游版本 | 0.6.7 |
| 使用方式 | 本仓库以其 MIT 源码为**衍生基础**，重做面板 UI 并新增功能 |
| 许可证 | MIT，`Copyright (c) 2026 oli20` |

本项目的 `src/core.mjs`、`src/zstd.mjs`、`src/chrome-storage.mjs`、`lib/index.js` 以及
`tools/` 下的构建与自检脚本派生自上游项目；`src/client/index.js` 在派生基础上重写了面板主体
（三视图、明细、导出），并保留上游的数据获取 hooks、样式 token 与 i18n 基础设施。
上游版权声明与许可按 MIT 要求保留如下。

`src/core.mjs`, `src/zstd.mjs`, `src/chrome-storage.mjs`, `lib/index.js` and the build/test
scripts under `tools/` are derived from the upstream project. `src/client/index.js` reworks the
panel body (three views, breakdown, export) while keeping the upstream data hooks, style tokens
and i18n scaffolding. The upstream copyright and permission notice are retained below.

### MIT License（上游 / upstream）

```
MIT License

Copyright (c) 2026 oli20

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 2. `@deepseek-ai/dsh-session-persistence-jsonl`（DeepSeek Harness）

| 项 | 值 |
|---|---|
| 上游项目 | DeepSeek Harness (DSH) |
| 上游仓库 | <https://github.com/deepseek-ai/deepseek-harness> |
| 涉及的包 | `@deepseek-ai/dsh-session-persistence-jsonl` |
| 使用位置 | 本仓库 `src/zstd.mjs` 的 `scanZstdFrames()` |
| 许可证 | MIT，`Copyright (c) 2026 DeepSeek` |

DSH 的 `.jsonl.zstd` 会话日志是**追加写入的多帧 zstd**，必须按帧边界切分后逐帧解压。
`src/zstd.mjs` 的帧边界扫描逻辑改写自上游包的 `scanZstdFrames()` 实现，其版权声明与
许可按 MIT 要求保留如下。

`src/zstd.mjs` adapts the Zstandard multi-frame **frame-boundary scanning logic** from that
package's `scanZstdFrames()` implementation. The upstream copyright and permission notice are
retained below.

### MIT License（上游 / upstream）

```
MIT License

Copyright (c) 2026 DeepSeek

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 3. 运行时依赖（不随本包分发）

下列包通过 `dependencies` / `peerDependencies` 在运行时由宿主提供，本项目**不再分发**其代码：

- `@deepseek-ai/schemastery`（MIT）— 设置项 schema
- `@deepseek-ai/cordis`、`@deepseek-ai/dsh-*`（均为 MIT，`Copyright (c) 2026 DeepSeek`）— DSH 内核服务

浏览器半侧产物 `lib/client.js` 中，`react` 等基座模块被标记为 external，由 DSH 客户端
模块系统在运行时提供，**未被打包进本项目的产物**。
