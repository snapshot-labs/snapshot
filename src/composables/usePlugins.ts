import { defineAsyncComponent } from 'vue';
import pluginIndex from '@/plugins/_index.json';

export function usePlugins(slotTemplate: string) {
  const components = {};

  const addComponents = (pluginKeys: string[]) => {
    pluginKeys.forEach(key => {
      components[key] = defineAsyncComponent(() => import(`../plugins/${key}/${slotTemplate}.vue`));
    });
  }

  return {
    pluginIndex,
    addComponents,
    components
  };
}
