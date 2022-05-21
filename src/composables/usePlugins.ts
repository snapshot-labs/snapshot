/**
 * Creates a plugin index from each individual plugin.json and provides
 * functions to register and load plugin components and filter plugins by a
 * search string (case insensitive), ordered by space count fetched from
 * backend.
 */

import { ref } from 'vue';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { PLUGINS_COUNT_QUERY } from '@/helpers/queries';

// aggregate all plugin.json files in src/plugins
const pluginIndex: Record<string, any> = Object.fromEntries(
  Object.entries(import.meta.globEager('../plugins/*/plugin.json')).map(
    ([path, config]) => {
      const pluginKey = path
        .replace('../plugins/', '')
        .replace('/plugin.json', '');
      return [pluginKey, { key: pluginKey, ...config }];
    }
  )
);

// import all plugin's main components (Create.vue, Proposal.vue, etc.)
// (plugin root directories should not contain any other components)
const allPluginComponents = import.meta.globEager(`../plugins/*/*.vue`);

// Based on list of active plugins in a space (pluginKeys) returns a list of
// required component objects for a specific location (componentName, e.g.
// Create) to then mount them with the built-in <component>... component. (e.g.
// in src/components/Plugin/Create.vue)
const getPluginComponents = (componentName: string, pluginKeys) => {
  pluginKeys = pluginKeys.filter(key => !!pluginIndex[key]); // remove old/non-existent plugins

  return Object.entries(allPluginComponents)
    .map(([path, componentModule]) => {
      if (path.endsWith(componentName + '.vue')) {
        const pluginKey = path
          .replace('../plugins/', '')
          .replace(`/${componentName}.vue`, '');

        if (pluginKeys.includes(pluginKey)) {
          // prefix component name for better debugging, e.g. in console warnings
          componentModule.default.name =
            'Plugins' +
            pluginKey[0].toUpperCase() +
            pluginKey.substring(1) +
            componentName;
          return componentModule.default;
        }
      }
      return null;
    })
    .filter(c => c);
};

// space count and filter function
const pluginsSpacesCount: any = ref(null);
const loadingPluginsSpacesCount = ref(false);

const { apolloQuery } = useApolloQuery();
const getPluginsSpacesCount = async () => {
  if (pluginsSpacesCount.value) return; // run only once

  loadingPluginsSpacesCount.value = true;
  const res = await apolloQuery({ query: PLUGINS_COUNT_QUERY }, 'plugins');
  // turn [{ id: "myPlugin", spaceCount: 1 }, ...] to { myPlugin: 1, ... }
  pluginsSpacesCount.value = res.reduce(
    (obj: any, item: any) => ({ ...obj, [item.id]: item.spacesCount }),
    {}
  );
  loadingPluginsSpacesCount.value = false;
};

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

/**
 * Composable
 *
 * Does it really make sense to use the composable pattern here? Most of it can
 * be normal imports.
 */
export function usePlugins() {
  return {
    pluginIndex,
    getPluginComponents,
    filterPlugins,
    getPluginsSpacesCount,
    pluginsSpacesCount,
    loadingPluginsSpacesCount
  };
}
