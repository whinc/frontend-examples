const child_process = require("child_process");

class MyCleanPlugin {
  constructor(options) {
    this.options = options;
  }
  /**
   * @type {import('webpack').WebpackPluginFunction}
   */
  apply(compiler) {
    compiler.hooks.beforeRun.tap("beforeRun", () => {
      console.log("beforeRun");
      child_process.execSync(`rm -rf ${this.options.dir}`);
    });
  }
}

module.exports = MyCleanPlugin;
