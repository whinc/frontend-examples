
`webpack-debug/build.js`
```js
const compiler = webpack.webpack(config);
```

`webpack/lib/webpack.js`
```js
const webpack = (options) => {
  // ...
  return createCompiler(options)
}
```

`webpack/lib/webpack.js`
```js 
const createCompiler = rawOptions => {
  // 正规化 options
	const options = getNormalizedWebpackOptions(rawOptions);
  // ...
  // 创建编译器（见下面）
	const compiler = new Compiler(options.context, options);
  // ...
  // 注册自定义插件
	if (Array.isArray(options.plugins)) {
		for (const plugin of options.plugins) {
			if (typeof plugin === "function") {
        // 调用插件函数
				plugin.call(compiler, compiler);
			} else if (plugin) {
        // 调用插件实例
				plugin.apply(compiler);
			}
		}
	}
  // 填充 options 默认值
	applyWebpackOptionsDefaults(options);
  // 触发 hooks
	compiler.hooks.environment.call();
	compiler.hooks.afterEnvironment.call();
  // 注册内置插件
	new WebpackOptionsApply().process(options, compiler);
  // 触发 hooks
	compiler.hooks.initialize.call();
	return compiler;
};
```

`webpack/lib/Compiler.js`
```js
const webpack = require("./");

class Compiler {
	constructor(context, options = {}) {
		this.hooks = Object.freeze({
			initialize: new SyncHook([]),
			shouldEmit: new SyncBailHook(["compilation"]),
			done: new AsyncSeriesHook(["stats"]),
			afterDone: new SyncHook(["stats"]),
      // ...
		});

		this.webpack = webpack;
    // ...
		this.options = options;
		this.context = context;
    // ...
	}
}
```

```js
class WebpackOptionsApply extends OptionsApply {
	process(options, compiler) {
    // ...
		new EntryOptionPlugin().apply(compiler);
    // 触发 hooks
		compiler.hooks.entryOption.call(options.context, options.entry);

    // ... 内置插件 apply

    // 触发 hooks
		compiler.hooks.afterPlugins.call(compiler);
    // ...
    // 触发 hooks
		compiler.hooks.afterResolvers.call(compiler);
		return options;
	}
}
```

`webpack-debug/build.js`
```js
const compiler = webpack.webpack(config);
compiler.run()
```

`webpack/lib/Compiler.js`
```js
class compiler {
	/**
	 * @param {Callback<Stats>} callback signals when the call finishes
	 * @returns {void}
	 */
	run(callback) {
		const finalCallback = (err, stats) => {
      // ...
			if (err) {
				this.hooks.failed.call(err);
			}
      // ...
			this.hooks.afterDone.call(stats);
		};

    // ...

		const onCompiled = (err, compilation) => {
			if (err) return finalCallback(err);

			if (this.hooks.shouldEmit.call(compilation) === false) {
        // ...
				const stats = new Stats(compilation);
				this.hooks.done.callAsync(stats, err => {
					if (err) return finalCallback(err);
					return finalCallback(null, stats);
				});
				return;
			}

			process.nextTick(() => {
        // ...
				this.emitAssets(compilation, err => {
					if (err) return finalCallback(err);

					if (compilation.hooks.needAdditionalPass.call()) {
            // ...
						const stats = new Stats(compilation);
						this.hooks.done.callAsync(stats, err => {
							if (err) return finalCallback(err);

							this.hooks.additionalPass.callAsync(err => {
								if (err) return finalCallback(err);
								this.compile(onCompiled);
							});
						});
						return;
					}

					this.emitRecords(err => {
						if (err) return finalCallback(err);

            // ...
						const stats = new Stats(compilation);
						this.hooks.done.callAsync(stats, err => {
							if (err) return finalCallback(err);
							this.cache.storeBuildDependencies(
								compilation.buildDependencies,
								err => {
									if (err) return finalCallback(err);
									return finalCallback(null, stats);
								}
							);
						});
					});
				});
			});
		};

		const run = () => {
			this.hooks.beforeRun.callAsync(this, err => {
				if (err) return finalCallback(err);

				this.hooks.run.callAsync(this, err => {
					if (err) return finalCallback(err);

					this.readRecords(err => {
						if (err) return finalCallback(err);

						this.compile(onCompiled);
					});
				});
			});
		};

    // ...
    run();
	}
}
```

`webpack/lib/Compiler.js`
```js
class Compiler {
	compile(callback) {
		const params = this.newCompilationParams();
		this.hooks.beforeCompile.callAsync(params, err => {
			if (err) return callback(err);

			this.hooks.compile.call(params);

			const compilation = this.newCompilation(params);

      // 这里 hooks.make 的 taps 中包含 EntryPlugin
      // 流程会走到 EntryPlugin 的 
			this.hooks.make.callAsync(compilation, err => {
				if (err) return callback(err);

        // 这里已完成编译，compilation 中可以拿到 module graph 信息了
				this.hooks.finishMake.callAsync(compilation, err => {
					if (err) return callback(err);

					process.nextTick(() => {
						compilation.finish(err => {
							if (err) return callback(err);
              // 内部创建 chunkGraph、生成 assets
							compilation.seal(err => {
								if (err) return callback(err);

								this.hooks.afterCompile.callAsync(compilation, err => {
									if (err) return callback(err);

									return callback(null, compilation);
								});
							});
						});
					});
				});
			});
		});
	}
}
```

```js
class EntryPlugin {

	apply(compiler) {
		compiler.hooks.compilation.tap(
			"EntryPlugin",
			(compilation, { normalModuleFactory }) => {
				compilation.dependencyFactories.set(
					EntryDependency,
					normalModuleFactory
				);
			}
		);

		const { entry, options, context } = this;
		const dep = EntryPlugin.createDependency(entry, options);

		compiler.hooks.make.tapAsync("EntryPlugin", (compilation, callback) => {
      // 编译入口文件，dep 包含了入口 src/index.js 的信息
			compilation.addEntry(context, dep, options, err => {
				callback(err);
			});
		});
	}
}
```