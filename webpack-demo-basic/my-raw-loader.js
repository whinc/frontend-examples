/**
 * @type {import('webpack').LoaderDefinitionFunction}
 */
module.exports = function (source) {
  const options = this.getOptions();
  let output = source;
  Object.keys(options).forEach((name) => {
    output = output.replace(`[${name}]`, options[name]);
  });
  return `module.exports = ${JSON.stringify(output)}`;
};
