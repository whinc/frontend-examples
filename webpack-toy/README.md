# webpack-toy

> 这是一个 webpack 的玩具性质的实现，用于学习 webpack 的实现原理，切勿用于生产。

实现的原型参考 [Ronen Amiel - Build Your Own Webpack](https://www.youtube.com/watch?v=Gc9-7PBqOC8)

模块解析步骤：
- 解析入口文件：输入文件名，输出模块ID、模块代码(经过 babel 转换成 cjs 格式)、模块依赖(使用 babel 解析 AST 后提取导入的依赖)
- 生成依赖图：递归解析依赖直到所有模块都解析完毕
- 生成打包代码：每个模块代码`function (require, module, module.exports){...}`包裹，自定义`require`函数，`require`入口模块

运行 Demo

```bash
pnpm install
pnpm start
```

目录结构
- `src` 输入的 es 模块代码
- `bundler.js` 极简的 webpack 打包器
- `dist.js` 输出的 cjs 打包代码