import { computed } from 'vue';
import skins from '@/../snapshot-spaces/skins';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import plugins from '@snapshot-labs/snapshot.js/src/plugins';
import validations from '@snapshot-labs/snapshot.js/src/validations';
import { useApp } from '@/composables/useApp';

export function useSearchFilters() {
  const { explore, spaces, strategies } = useApp();

  const minifiedSkinsArray = computed(() =>
    Object.keys(skins).map(s => ({
      key: s,
      spaces: explore.value.skins[s] ?? 0
    }))
  );

  const filteredSkins = (q = '') =>
    minifiedSkinsArray.value
      .filter(s => s.key.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.spaces - a.spaces);

  const minifiedStrategiesArray = computed(() =>
    Object.keys(strategies.value).map(s => ({
      key: s,
      spaces: explore.value.strategies[s] ?? 0,
      ...strategies.value[s]
    }))
  );

  const filteredStrategies = (q = '') =>
    minifiedStrategiesArray.value
      .filter(s => s.key.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.spaces - a.spaces);

  const minifiedNetworksArray = computed(() =>
    Object.keys(networks).map(n => ({
      spaces: explore.value.networks[n] ?? 0,
      ...networks[n]
    }))
  );

  const filteredNetworks = (q = '') =>
    minifiedNetworksArray.value
      .filter(n => JSON.stringify(n).toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.spaces - a.spaces);

  const minifiedPluginsArray = computed(() =>
    Object.entries(plugins).map(([key, pluginClass]: any) => {
      const plugin = new pluginClass();
      plugin.key = key;
      plugin.spaces = explore.value.plugins[key] ?? 0;
      return plugin;
    })
  );

  const filteredPlugins = (q = '') =>
    minifiedPluginsArray.value
      .filter(plugin =>
        JSON.stringify(plugin).toLowerCase().includes(q.toLowerCase())
      )
      .sort((a, b) => b.spaces - a.spaces);

  const minifiedValidationsArray = computed(() =>
    Object.keys(validations).map((key: any) => ({
      name: key,
      spaces: Object.entries(spaces.value)
        .filter((space: any) => space[1].validation?.name === key)
        .map(space => space[0])
    }))
  );

  const filteredValidations = (q = '') =>
    minifiedValidationsArray.value
      .filter(v => JSON.stringify(v).toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.spaces.length - a.spaces.length);

  return {
    filteredSkins,
    filteredStrategies,
    filteredNetworks,
    filteredPlugins,
    filteredValidations
  };
}
