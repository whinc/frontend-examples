const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const { transformFromAstSync } = require("@babel/core");
const fs = require("node:fs");
const path = require("node:path");
const prettier = require("prettier");

// 全局的模块 ID，每个模块的唯一标识
let ID = 0;

function createAsset(filename, { loaders }) {
  const id = ID++;

  let source = fs.readFileSync(filename, "utf-8");

  // 遍历加载器，从右往左依次执行
  for (let i = loaders.length - 1; i >= 0; i--) {
    const { test, loader, options } = loaders[i];
    if (!test.test(filename)) continue;
    source = loader(source, options);
  }

  const ast = parse(source, {
    sourceType: "module",
  });

  const dependencies = [];
  traverse(ast, {
    ImportDeclaration(path) {
      dependencies.push(path.node.source.value);
    },
  });

  // 转换成 cjs 模块
  const result = transformFromAstSync(ast, undefined, {
    plugins: ["@babel/plugin-transform-modules-commonjs"],
  });

  return {
    // 模块ID
    id,
    // 模块名称
    filename,
    // 模块代码
    code: result.code,
    // 模块依赖
    dependencies,
    // // 模块名称和模块ID的映射
    mapping: {},
  };
}

function createGraph(filename, config) {
  const module = createAsset(filename, config);

  const graph = [];

  const queue = [module];
  for (const m of queue) {
    graph.push(m);
    m.dependencies.forEach((depFilename) => {
      const depModule = createAsset(
        path.join(path.dirname(module.filename), depFilename),
        config,
      );
      m.mapping[depFilename] = depModule.id;
      queue.push(depModule);
    });
  }

  return graph;
}

function generateCode(graph) {
  const modules = `{${graph
    .map(
      (m) => `${m.id}: {
      fn: function (require, module, exports) {
        ${m.code}
      },
      mapping: ${JSON.stringify(m.mapping)}
    }`,
    )
    .join(",")}}`;

  const code = `(function (modules) {

    function require(id) {
      const module = {exports: {}};

      function localRequire(filename) {
        return require(modules[id].mapping[filename])
      }

      modules[id].fn(localRequire, module, module.exports)

      return module.exports;
    }

    require(0)
  })(${modules})`;
  return code;
}

// 加载文本文件，并替换其中的变量
const rawLoader = function (source, options) {
  let output = source;
  Object.keys(options).forEach((name) => {
    output = output.replace(`[${name}]`, options[name]);
  });
  return `export default ${JSON.stringify(output)}`;
};

const config = {
  loaders: [
    {
      test: /\.txt$/,
      loader: rawLoader,
      options: {
        name: "whincwu",
      },
    },
  ],
};

const graph = createGraph("./src/index.js", config);

const code = generateCode(graph);
prettier.format(code, { parser: "babel" }).then((formattedCode) => {
  fs.writeFileSync("dist.js", formattedCode, "utf-8");
});
