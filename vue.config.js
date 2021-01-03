const path = require('path');

module.exports = {
  publicPath: './',
  pluginOptions: {
    webpackBundleAnalyzer: {
      openAnalyzer: false
    }
  },
  chainWebpack: config => {
    config.resolve.alias.set(
      'bn.js',
      path.resolve(path.join(__dirname, 'node_modules', 'bn.js'))
    );
  }
};
