import skins from '@/helpers/skins';
import strategies from '@/helpers/strategies';
import plugins from '@snapshot-labs/snapshot.js/src/plugins';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';

import { getStrategy } from '@/helpers/utils';

import { computed } from 'vue';

export function useSkinsFilter(spaces) {
  const minifiedSkinsObject = computed(() => {
    return skins.map(skin => ({
      key: skin,
      spaces: Object.entries(spaces)
        .filter((space: any) => space[1].skin === skin)
        .map(space => space[0])
    }));
  });

  const filteredSkins = q => {
    return minifiedSkinsObject.value
      .filter(skin => skin.key.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.spaces.length - a.spaces.length);
  };

  return { filteredSkins, minifiedSkinsObject };
}

export function useStrategyFilter(spaces) {
  const minifiedStrategiesObject = computed(() => {
    return Object.values(strategies).map(strategy =>
      getStrategy(strategy, spaces)
    );
  });

  const filteredStrategies = q => {
    return minifiedStrategiesObject.value
      .filter(skin => skin.key.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.spaces.length - a.spaces.length);
  };

  return { filteredStrategies, minifiedStrategiesObject };
}

export function useNetworkFilter(spaces) {
  const minifiedNetworksObject = computed(() => {
    return Object.entries(networks).map((network: any) => {
      network[1].key = network[0];
      network[1].spaces = Object.entries(spaces)
        .filter((space: any) => space[1].network === network[0])
        .map(space => space[0]);
      return network[1];
    });
  });

  const filteredNetworks = q => {
    return minifiedNetworksObject.value
      .filter(network =>
        JSON.stringify(network).toLowerCase().includes(q.toLowerCase())
      )
      .sort((a, b) => b.spaces.length - a.spaces.length);
  };

  return { filteredNetworks, minifiedNetworksObject };
}

export function usePluginFilter(spaces) {
  const minifiedPluginsObject = computed(() => {
    return Object.entries(plugins).map(([key, pluginClass]: any) => {
      const plugin = new pluginClass();
      plugin.key = key;
      plugin.spaces = Object.entries(spaces)
        .filter(
          (space: any) =>
            space[1].plugins &&
            Object.keys(space[1].plugins).includes(plugin.key)
        )
        .map(space => space[0]);
      return plugin;
    });
  });

  const filteredPlugins = q => {
    return minifiedPluginsObject.value
      .filter(plugin =>
        JSON.stringify(plugin).toLowerCase().includes(q.toLowerCase())
      )
      .sort((a, b) => b.spaces.length - a.spaces.length);
  };

  return { filteredPlugins, minifiedPluginsObject };
}
