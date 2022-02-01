/**
 * Creates a plugin index from each individual plugin.json and provides
 * functions to register and load plugin components and filter plugins by a
 * search string (case insensitive), ordered by space count fetched from
 * backend.
 */

import { ref, defineAsyncComponent } from 'vue';
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

// prepare all plugin's main components imports (Create.vue, Proposal.vue, etc.)
// doesn't actually import anything but prepares functions to use with
// defineAsyncComponent below
const allPluginComponents = import.meta.glob(`../plugins/*/*.vue`);

// get required components for specific location (componentName) and list of active plugins
const getPluginComponents = (componentName: string, pluginKeys) => {
  pluginKeys = pluginKeys.filter(key => !!pluginIndex[key]); // remove old/non-existent plugins

  return Object.entries(allPluginComponents)
    .filter(([path]) => {
      if (path.endsWith(componentName + '.vue')) {
        const pluginKey = path
          .replace('../plugins/', '')
          .replace(`/${componentName}.vue`, '');
        return pluginKeys.includes(pluginKey);
      }
      return false;
    })
    .map(comp => defineAsyncComponent(comp[1]));
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
    loadingPluginsSpaceCount
  };
}
