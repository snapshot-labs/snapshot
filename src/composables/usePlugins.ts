/**
 * Creates a plugin index from each individual plugin.json and provides
 * functions to register and load plugin components, execute hooks and filter
 * plugins by a search string (case insensitive), ordered by space count
 * fetched from backend.
 */

import { ref, defineAsyncComponent } from 'vue';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { PLUGINS_COUNT_QUERY } from '@/helpers/queries';

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

// takes the space's enabled plugins (pluginKeys), checks if they have the
// specified hook (hookName) in their plugin.json, imports and executes them
const executePluginHooks = async (hookName, pluginKeys, payload) => {
  for (let i = 0; i < pluginKeys.length; i++) {
    const hookPath = pluginIndex[pluginKeys[i]].hooks?.[hookName]?.replace(/\.ts$/i, '').replace(/^\.\//, '');
    if (hookPath) {
      const { default: hook } = await import(`../plugins/${pluginKeys[i]}/${hookPath}.ts`);
      await hook(payload);
    }
  }
};

// space count and filter function
const pluginsSpacesCount: any = ref(null);
const loadingPluginsSpaceCount = ref(false);

const { apolloQuery } = useApolloQuery();
const getPluginsSpacesCount = async () => {
  if (pluginsSpacesCount.value) return; // run only once

  loadingPluginsSpaceCount.value = true;
  const res = await apolloQuery({ query: PLUGINS_COUNT_QUERY }, 'plugins');
  // turn [{ id: "myPlugin", spaceCount: 1 }, ...] to { myPlugin: 1, ... }
  pluginsSpacesCount.value = res.reduce(
    (obj: any, item: any) => ({ ...obj, [item.id]: item.spacesCount }),
    {}
  );
  loadingPluginsSpaceCount.value = false;
}

const filterPlugins = (q = '') =>
  Object.values(pluginIndex)
    .filter(plugin =>
      JSON.stringify(plugin).toLowerCase().includes(q.toLowerCase())
    )
    .sort(
      (a, b) =>
        (pluginsSpacesCount.value?.[b.key] ?? 0) -
        (pluginsSpacesCount.value?.[a.key] ?? 0)
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
    pluginKeys
      // remove any old plugin keys that don't exist in the index anymore and
      // don't try to load such components
      .filter(key => pluginIndex[key])
      .forEach(key => {
      components[key] = defineAsyncComponent(
        () => import(`../plugins/${key}/${slotTemplateName}.vue`)
      );
    });
  };

  return {
    pluginIndex,
    components,
    addComponents,
    setTemplateName,
    executePluginHooks,
    filterPlugins,
    getPluginsSpacesCount,
    pluginsSpacesCount,
    loadingPluginsSpaceCount
  };
}
