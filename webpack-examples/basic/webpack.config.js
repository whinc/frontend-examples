const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MyCleanPlugin = require("./my-clean-plugin");
const FileListPlugin = require("./file-list-plugin");
const path = require("path");
const VuePlugin = require("./vue-plugin");

/** @type {import("webpack").Configuration} */
module.exports = {
  mode: "development",
  devtool: false,
  // 指定多个入口文件
  entry: {
    index: "./src/index.js",
    index2: "./src/index2.js",
  },
  // 多个入口文件时，需使用占位符指定输出文件，确保每个入口对应唯一的出口文件
  output: {
    filename: "[name].js",
    path: __dirname + "/dist",
    // 影响生成的 html 文件中 <script src="${publicPath}${filename}"> 标签
    // publicPath: "https://cdn.example.com/static/[hash]",
  },
  module: {
    // rules: [{ test: /\.txt$/, use: "raw-loader" }],
    rules: [
      {
        test: /\.txt$/,
        use: {
          loader: path.join(__dirname, "my-raw-loader.js"),
          options: {
            name: "whincwu",
          },
        },
      },
      {
        test: /\.vue$/,
        use: {
          loader: path.join(__dirname, "vue-loader.js"),
        },
      },
    ],
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      // 指定入口文件对应输出文件的名称
      filename: "[name].html",
      // or
      // filename: (entryName) => `${entryName}.html`,
    }),
    // 自定义插件：在编译之前删除dist文件夹
    new MyCleanPlugin({ dir: "./dist" }),
    new FileListPlugin({ outputFile: "assets.md" }),
    new VuePlugin(),
  ],
};
