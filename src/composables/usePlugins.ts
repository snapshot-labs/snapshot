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

  return {
    pluginIndex,
    addComponents,
    setTemplateName,
    components
  };
}
