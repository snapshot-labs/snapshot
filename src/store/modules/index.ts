import camelCase from 'lodash/camelCase';

const requireModule = require.context('.', false, /\.ts$/);
const modules = {};

requireModule.keys().forEach(fileName => {
  if (fileName === './index.ts') return;
  const moduleName = camelCase(fileName.replace(/(\.\/|\.ts)/g, ''));
  modules[moduleName] = requireModule(fileName).default;
});

export default modules;
