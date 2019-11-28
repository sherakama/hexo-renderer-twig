'use strict';

var Twig = require('twig');
var path = require('path');
var extend = require('util')._extend;
var twig = Twig.twig;
Twig.cache(false);


/**
 * [twigNormalizeConfig description]
 * @param  {[type]} data    [description]
 * @param  {[type]} options [description]
 * @param  {[type]} config  [description]
 * @return {[type]}         [description]
 */
function twigNormalizeConfig(data, options) {
  // Support global and theme-specific config
  var themeConfig = options.theme || {};
  var projectConfig = options.config || {};
  var userConfig = extend(
      themeConfig.twig || {},
      projectConfig.twig || {}
  );
  var defaultConfig = {
    namespaces: {
      node_modules: path.resolve(__dirname, '../../')
    },
    extensions: []
  };

  return extend(defaultConfig, userConfig);
}

/**
 * [twigNamespaces description]
 * @param  {[type]} data    [description]
 * @param  {[type]} options [description]
 * @param  {[type]} config  [description]
 * @return {[type]}         [description]
 */
function twigNamespaces(data, options, config) {
  var entries = Object.entries(config.namespaces);
  for (const [id, dir] of entries) {
    config.namespaces[id] = path.resolve(dir);
  }
  return config;
}

/**
 * [twigCompile description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function twigCompile(data, options, config) {
  return twig({
    data: data.text,
    path: data.path,
    namespaces: config.namespaces
  });
}

/**
 * [twigExtend description]
 * @param  {[type]} data    [description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
function twigExtend(data, options, config) {
  for (var i in config.extensions) {
    var ext = require(config.extensions[i]);
    ext(Twig);
  }
}

/**
 * [twigRenderer description]
 * @param  {[type]} data    [description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
var twigRenderer = function(data, options) {
  var config = twigNormalizeConfig(data, options);
  config = twigNamespaces(data, options, config);
  twigExtend(data, options, config);
  var compile = twigCompile(data, options, config);
  return compile.render(options);
}


twigRenderer.twig = Twig;
module.exports = twigRenderer;
