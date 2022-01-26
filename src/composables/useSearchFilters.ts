import { computed } from 'vue';
import { useApp } from '@/composables/useApp';

export function useSearchFilters() {
  const { strategies, explore } = useApp();

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

  return {
    filteredStrategies,
    minifiedStrategiesArray
  };
}
