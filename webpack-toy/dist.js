(function (modules) {
  function require(id) {
    const module = { exports: {} };

    function localRequire(filename) {
      return require(modules[id].mapping[filename]);
    }

    modules[id].fn(localRequire, module, module.exports);

    return module.exports;
  }

  require(0);
})({
  0: {
    fn: function (require, module, exports) {
      "use strict";

      var _message = _interopRequireDefault(require("./message.js"));
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      console.log(_message.default);
    },
    mapping: { "./message.js": 1 },
  },
  1: {
    fn: function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true,
      });
      exports.default = void 0;
      var _name = require("./name.js");
      var _default = `hello ${_name.name}`;
      exports.default = _default;
    },
    mapping: { "./name.js": 2 },
  },
  2: {
    fn: function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true,
      });
      exports.name = void 0;
      const name = "whincwu";
      exports.name = name;
    },
    mapping: {},
  },
});
