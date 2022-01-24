import { defineAsyncComponent } from 'vue';

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

  const setTemplateName = (name: string) => {
    slotTemplateName = name;
  };

  const addComponents = (pluginKeys: string[]) => {
    pluginKeys.forEach(key => {
      components[key] = defineAsyncComponent(
        () => import(`../plugins/${key}/${slotTemplateName}.vue`)
      );
    });
  };

  const executePluginHooks = async (hookName, pluginKeys, payload) => {
    for (let i = 0; i < pluginKeys.length; i++) {
      const hookPath = pluginIndex[pluginKeys[i]].hooks?.[hookName]?.replace(/\.ts$/i, '').replace(/^\.\//, '');
      console.log(hookPath)
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
