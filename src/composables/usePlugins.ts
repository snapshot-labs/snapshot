import pluginIndex from '@/plugins';

export function usePlugins() {
  const pluginName = (key: string) => pluginIndex[key].name;

  return {
    pluginIndex,
    pluginName
  };
}
