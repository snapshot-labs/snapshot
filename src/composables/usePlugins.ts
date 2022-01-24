/**
 * Creates a plugin index from each individual plugin.json and provide
 * functions to register and load plugin components and execute hooks.
 */

import { defineAsyncComponent } from 'vue';

// aggregate all plugin.json files in src/plugins
const pluginIndex: Object = Object.fromEntries(
  Object.entries(import.meta.globEager('../plugins/*/plugin.json')).map(
    ([path, config]) => {
      const pluginKey = path
        .replace('../plugins/', '')
        .replace('/plugin.json', '');
      return [pluginKey, { key: pluginKey, ...config }];
    }
  )
);

export function usePlugins() {
  let slotTemplateName: string;
  const components = {};

  // needs to be called before addComponents
  const setTemplateName = (name: string) => {
    slotTemplateName = name;
  };

  // used in the template slot files (e.g. src/plugins/Proposal.vue)
  // by plugin devs to register their plugin's components
  const addComponents = (pluginKeys: string[]) => {
    pluginKeys.forEach(key => {
      components[key] = defineAsyncComponent(
        () => import(`../plugins/${key}/${slotTemplateName}.vue`)
      );
    });
  };

  // takes the space's enabled plugins (pluginKeys), checks if they have the
  // specified hook (hookName) in their plugin.json, imports and executes them
  const executePluginHooks = async (hookName, pluginKeys, payload) => {
    for (let i = 0; i < pluginKeys.length; i++) {
      const hookPath = pluginIndex[pluginKeys[i]].hooks?.[hookName]?.replace(/\.ts$/i, '').replace(/^\.\//, '');
      if (hookPath) {
        const { default: hook } = await import(`../plugins/${pluginKeys[i]}/${hookPath}.ts`);
        hook(payload);
      }
    }
  };

  return {
    pluginIndex,
    components,
    addComponents,
    setTemplateName,
    executePluginHooks
  };
}
