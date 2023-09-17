const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const { transformFromAstSync } = require("@babel/core");
const fs = require("node:fs");
const path = require("node:path");
const prettier = require("prettier");

// 全局的模块 ID，每个模块的唯一标识
let ID = 0;

function createAsset(filename) {
  const id = ID++;

  const code = fs.readFileSync(filename, "utf-8");
  const ast = parse(code, {
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

function createGraph(filename) {
  const module = createAsset(filename);

  const graph = [];

  const queue = [module];
  for (const m of queue) {
    graph.push(m);
    m.dependencies.forEach((depFilename) => {
      const depModule = createAsset(
        path.join(path.dirname(module.filename), depFilename),
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

const graph = createGraph("./src/index.js");
const code = generateCode(graph);
prettier
  .format(code, { tabWidth: 2, parser: "babel" })
  .then((formattedCode) => {
    fs.writeFileSync("dist.js", formattedCode, "utf-8");
  });
