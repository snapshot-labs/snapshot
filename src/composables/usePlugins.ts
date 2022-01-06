import { defineAsyncComponent } from 'vue';

const pluginIndex = Object.fromEntries(
  Object.entries(import.meta.globEager('../plugins/*/plugin.json')).map(
    ([path, config]) => {
      const pluginKey = path
        .replace('../plugins/', '')
        .replace('/plugin.json', '');
      return [pluginKey, { key: pluginKey, ...config }];
    }
  )
);

export function usePlugins(slotTemplate: string) {
  const components = {};

  const addComponents = (pluginKeys: string[]) => {
    pluginKeys.forEach(key => {
      components[key] = defineAsyncComponent(
        () => import(`../plugins/${key}/${slotTemplate}.vue`)
      );
    });
  };

  return {
    pluginIndex,
    addComponents,
    components
  };
}
