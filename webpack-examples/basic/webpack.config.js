const child_process = require("child_process");
const HtmlWebpackPlugin = require("html-webpack-plugin");
/** @type {import("webpack").Configuration} */
module.exports = {
  mode: "development",
  // 指定多个入口文件
  entry: {
    index: "./src/index.js",
    index2: "./src/index2.js",
  },
  // 多个入口文件时，需使用占位符指定输出文件，确保每个入口对应唯一的出口文件
  output: {
    filename: "[name].js",
    path: __dirname + "/dist",
  },
  module: {
    rules: [{ test: /\.txt$/, use: "raw-loader" }],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      // 指定入口文件对应输出文件的名称
      filename: "[name].html",
      // or
      // filename: (entryName) => `${entryName}.html`,
    }),
    // 自定义插件：在编译之前删除dist文件夹

    {
      apply(/** @type {import("webpack").Compiler} */ compiler) {
        compiler.hooks.beforeRun.tap("beforeRun", () => {
          console.log("beforeRun");
          child_process.execSync("rm -rf ./dist");
        });
      },
    },
  ],
};
