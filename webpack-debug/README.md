# webpack 源码调试

## 启动调试

```bash
# 准备依赖
pnpm run setup

# 启动调试（在 build.js 文件中设置断点)
pnpm start
```

## 插件调试

webpack 内置了很多插件，可以拿来调试学习如何使用。首先在 webpack.config.js 中注册插件，然后在 webpack 插件源码中断点调试。

可以从简单的 BannerPlugin 开始

## 参考资料

- [tabpable](https://github.com/webpack/tapable)
- [一文吃透 Webpack 核心原理](https://xie.infoq.cn/article/ddca4caa394241447fa0aa3c0)