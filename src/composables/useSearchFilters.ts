import { computed } from 'vue';
import skins from '@/../snapshot-spaces/skins';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import plugins from '@/../snapshot-plugins/src/plugins';
import validations from '@snapshot-labs/snapshot.js/src/validations';
import { useApp } from '@/composables/useApp';

export function useSearchFilters() {
  const { strategies, explore } = useApp();

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
      .filter(n => !n.disabled)
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
      spaces: explore.value.validations[key]
    }))
  );
  const filteredValidations = (q = '') =>
    minifiedValidationsArray.value
      .filter(v => JSON.stringify(v).toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.spaces - a.spaces);

  return {
    filteredSkins,
    filteredStrategies,
    filteredNetworks,
    filteredPlugins,
    filteredValidations,
    minifiedStrategiesArray
  };
}
