const webpack = require("webpack");
const config = require("./webpack.config");

const compiler = webpack.webpack(config);
compiler.run(function (err, stats) {
  if (err) {
    console.error(err);
    return;
  }
  console.log("build OK!!!");
});
