import { computed } from 'vue';
import skins from '@snapshot-labs/snapshot-spaces/skins';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import plugins from '@snapshot-labs/snapshot.js/src/plugins';
import validations from '@snapshot-labs/snapshot.js/src/validations';
import { getStrategy } from '@/helpers/utils';
import { useApp } from '@/composables/useApp';
import { useSpaces } from '@/composables/useSpaces';

export function useSearchFilters() {
  const { strategies } = useApp();
  const { spaces } = useSpaces();

  const minifiedSkinsArray = computed(() => {
    return Object.keys(skins).map(skin => ({
      key: skin,
      spaces: spaces.value
        .filter((space: any) => space.skin === skin)
        .map(space => space.id)
    }));
  });

  const filteredSkins = (q = '') => {
    return minifiedSkinsArray.value
      .filter(skin => skin.key.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.spaces.length - a.spaces.length);
  };

  const minifiedStrategiesArray = computed(() => {
    return Object.values(strategies.value).map(strategy =>
      getStrategy(strategy, spaces.value)
    );
  });

  const filteredStrategies = (q = '') => {
    return minifiedStrategiesArray.value
      .filter(skin => skin.key.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.spaces.length - a.spaces.length);
  };

  const minifiedNetworksArray = computed(() => {
    return Object.entries(networks).map((network: any) => {
      network[1].key = network[0];
      network[1].spaces = spaces.value
        .filter((space: any) => space.network === network[0])
        .map(space => space.id);
      return network[1];
    });
  });

  const filteredNetworks = (q = '') => {
    return minifiedNetworksArray.value
      .filter(network =>
        JSON.stringify(network).toLowerCase().includes(q.toLowerCase())
      )
      .sort((a, b) => b.spaces.length - a.spaces.length);
  };

  const minifiedPluginsArray = computed(() => {
    return Object.entries(plugins).map(([key, pluginClass]: any) => {
      const plugin = new pluginClass();
      plugin.key = key;
      plugin.spaces = spaces.value
        .filter(
          (space: any) =>
            space.plugins && Object.keys(space.plugins).includes(plugin.key)
        )
        .map(space => space.id);
      return plugin;
    });
  });

  const filteredPlugins = (q = '') => {
    return minifiedPluginsArray.value
      .filter(plugin =>
        JSON.stringify(plugin).toLowerCase().includes(q.toLowerCase())
      )
      .sort((a, b) => b.spaces.length - a.spaces.length);
  };

  const minifiedValidationsArray = computed(() => {
    return Object.keys(validations).map((key: any) => {
      return {
        name: key,
        spaces: spaces.value
          .filter((space: any) => space.validation?.name === key)
          .map(space => space.id)
      };
    });
  });

  const filteredValidations = (q = '') => {
    return minifiedValidationsArray.value
      .filter(validation =>
        JSON.stringify(validation).toLowerCase().includes(q.toLowerCase())
      )
      .sort((a, b) => b.spaces.length - a.spaces.length);
  };

  return {
    filteredSkins,
    filteredStrategies,
    filteredNetworks,
    filteredPlugins,
    filteredValidations
  };
}
