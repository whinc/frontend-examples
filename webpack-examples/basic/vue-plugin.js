const { transformSync } = require("@babel/core");
class VuePlugin {
  /**
   * @type {import('webpack').WebpackPluginFunction}
   */
  apply(compiler) {
    compiler.hooks.compilation.tap(VuePlugin.name, (compilation) => {
      compilation.hooks.succeedModule.tap(VuePlugin.name, (module) => {
        // .vue 文件加载完成后，将 loader 解析得到的 template 和 style 部分添加到编译过程中，
        // 使其继续走对应  loader 加载和输出过程
        if (module.identifier().endsWith(".vue")) {
          const source = module.originalSource().source();
          // const sourceCJS = transformSync(source.toString(), {
          //   plugins: ["@babel/plugin-transform-modules-commonjs"],
          // }).code;
          // const { template, style } = eval(sourceCJS);
          // compilation.emitAsset(
          //   "template.html",
          //   new compiler.webpack.sources.RawSource(template)
          // );
          // compilation.emitAsset(
          //   "style.css",
          //   new compiler.webpack.sources.RawSource(style)
          // );
        }
      });
    });
  }
}

module.exports = VuePlugin;
