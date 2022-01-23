import { computed, onMounted, ref } from 'vue';
import { useApp } from '@/composables/useApp';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { STRATEGIES_COUNT_QUERY } from '@/helpers/queries';

export function useStrategies() {
  const { strategies } = useApp();

  const loading = ref(false);
  const strategiesSpacesCount: any = ref(null);

  const minifiedStrategiesArray = computed(() => {
    return Object.keys(strategies.value).map(s => ({
      key: s,
      spacesCount: strategiesSpacesCount.value?.[s] ?? 0,
      version: strategies.value[s].version,
      author: strategies.value[s].author
    }));
  });

  const filteredStrategies = (q = '') =>
    minifiedStrategiesArray.value
      .filter(s => s.key.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.spacesCount - a.spacesCount);

  const { apolloQuery } = useApolloQuery();

  onMounted(async () => {
    loading.value = true;
    const strategiesObj = await apolloQuery(
      {
        query: STRATEGIES_COUNT_QUERY
      },
      'strategies'
    );
    strategiesSpacesCount.value = strategiesObj.reduce(
      (obj: any, item: any) => ({ ...obj, [item.id]: item.spacesCount }),
      {}
    );

    loading.value = false;
  });
  return {
    minifiedStrategiesArray,
    filteredStrategies,
    loadingStrategies: loading
  };
}
