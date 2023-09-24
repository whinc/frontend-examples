const webpack = require("webpack");
/** @type {import('webpack').Configuration} */
module.exports = {
  entry: "./src/index.js",
  output: {
    path: __dirname + "/dist",
    filename: "bundle.js",
  },
  devtool: "cheap-module-source-map",
  optimization: {
    minimize: false,
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new webpack.BannerPlugin("-*-*-*-*-*-*-*-*-*-*"),
  ],
  infrastructureLogging: {
    level: "info",
  },
};
