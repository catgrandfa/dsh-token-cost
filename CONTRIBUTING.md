# Contributing

感谢你愿意一起把这个插件做得更准、更好用。这个仓库是
[`dsh-token-meter-panel`](https://github.com/olimc2016/dsh-token-meter-panel) 的衍生项目，
所以有几条额外约定：

## 提交前

```bash
npm install --cache /tmp/dsh-npm-cache
npm run setup
npm run build
npm test
```

- `lib/client.js` 与 `.map` 是**入库的构建产物**：改了 `src/client/**` 必须重新 build 并一起提交。
- 改了判定逻辑（计价、分桶、代际去重、导出筛选）要**反向验证**：先故意改坏确认测试变红，再恢复。
- README 截图一律用合成数据生成，避免把任何人的真实会话 / 路径 / 余额带进公开仓库：

  ```bash
  node tools/preview.mjs --demo --view overview --out /tmp/overview.html
  ```

## 不要提交

- 账号、token、cookie、密钥、内部地址
- 真实会话标题、工作区路径、余额截图
- `.npmrc`、`node_modules/`、打包产物

## 新增功能

- 面板相关：先读 `src/client/index.js` 顶部的数据流注释；UI 全部用 `React.createElement`（无 JSX）。
- 宿主相关：`lib/index.js` 的 `ctx.webServer.register({...})` 写在数组里，每项结尾是 `}),`。
- 新增设置项：同时改 `DEFAULTS`、schemastery schema、`value.config` 与设置路由白名单，
  并在 `tools/smoke-host.mjs` 加断言。
- 新增导出数据集：同时改 `EXPORT_DATASETS`、`exportRows()`、`EXPORT_COLUMNS` 与烟测。

## 代码风格

- 注释写「为什么」，不要复述代码；中文注释为主。
- 金额 / token 一律标注口径，官方数据与本地推算不混在同一张表里。
- 不引入新的运行时依赖；CLI 工具只用 `node:` 内置模块。

## License

提交即表示同意以本仓库的 MIT 许可证发布；衍生自上游的代码需保留
[THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) 中的版权声明。
