/**
 * @type {import('webpack').LoaderDefinitionFunction}
 */
module.exports = function (source) {
  const match =
    /^<template[^>]*>(.*)<\/template>\s*<script[^>]*>(.*)<\/script>\s*<style[^>]*>(.*)<\/style>$/gms.exec(
      source
    );
  const [, template, script, style] = match;
  return `export const template = ${JSON.stringify(template)}
${script}
export const style = ${JSON.stringify(style)} `;
};
