/**
 * Get list of plugins and order them by popularity
 * Filter list of plugins by a search string
 */

import { computed, ref } from 'vue';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { PLUGINS_COUNT_QUERY } from '@/helpers/queries';
import plugins from '@/../snapshot-plugins/src/plugins';

const pluginsSpacesCount: any = ref(null);

export function usePlugins() {
  const loading = ref(false);

  const minifiedPluginsArray = computed(() =>
    Object.entries(plugins).map(([key, pluginClass]: any) => {
      const plugin = new pluginClass();
      plugin.key = key;
      plugin.spacesCount = pluginsSpacesCount.value?.[key] ?? 0;
      return plugin;
    })
  );

  const filterePlugins = (q = '') =>
    minifiedPluginsArray.value
      .filter(plugin =>
        JSON.stringify(plugin).toLowerCase().includes(q.toLowerCase())
      )
      .sort((a, b) => b.spacesCount - a.spacesCount);

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
    minifiedPluginsArray,
    filterePlugins,
    getPluginsSpacesCount,
    loadingPlugins: loading
  };
}
