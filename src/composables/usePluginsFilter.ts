/**
 * Orders plugins by spaces count and returns a list of plugins
 * filtered by the search string (case insensitive).
 */

import { computed, ref } from 'vue';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { PLUGINS_COUNT_QUERY } from '@/helpers/queries';
import plugins from '@/../snapshot-plugins/src/plugins';

const pluginsSpacesCount: any = ref(null);

export function usePluginsFilter() {
  const loading = ref(false);

  const pluginsArray = computed(() =>
    Object.entries(plugins).map(([key, pluginClass]: any) => {
      const plugin = new pluginClass();
      plugin.key = key;
      return plugin;
    })
  );

  const filterPlugins = (q = '') =>
    pluginsArray.value
      .filter(plugin =>
        JSON.stringify(plugin).toLowerCase().includes(q.toLowerCase())
      )
      .sort(
        (a, b) =>
          (pluginsSpacesCount.value?.[b.key] ?? 0) -
          (pluginsSpacesCount.value?.[a.key] ?? 0)
      );

  const { apolloQuery } = useApolloQuery();

  async function getPluginsSpacesCount() {
    if (pluginsSpacesCount.value) return;
    loading.value = true;
    const res = await apolloQuery(
      {
        query: PLUGINS_COUNT_QUERY
      },
      'plugins'
    );
    pluginsSpacesCount.value = res.reduce(
      (obj: any, item: any) => ({ ...obj, [item.id]: item.spacesCount }),
      {}
    );
    loading.value = false;
    return;
  }
  return {
    pluginsArray,
    filterPlugins,
    getPluginsSpacesCount,
    pluginsSpacesCount,
    loadingPlugins: loading
  };
}
