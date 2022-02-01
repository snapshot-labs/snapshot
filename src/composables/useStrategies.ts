/**
 * Orders strategies by spaces count and returns a list of strategies
 * filtered by the search string (case insensitive).
 */

import { ref } from 'vue';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { STRATEGIES_QUERY, EXTENDED_STRATEGIES_QUERY } from '@/helpers/queries';
import { Strategy } from '@/helpers/interfaces';

const strategies = ref<Strategy[] | []>([]);
const extendedStrategies = ref<Strategy[] | []>([]);

export function useStrategies() {
  const loadingStrategies = ref(false);

  const filterStrategies = (q = '') =>
    strategies.value
      .filter(s => s.id.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.spacesCount - a.spacesCount);

  const { apolloQuery } = useApolloQuery();

  async function getStrategies() {
    if (strategies.value.length > 0) return;
    loadingStrategies.value = true;
    strategies.value = await apolloQuery(
      {
        query: STRATEGIES_QUERY
      },
      'strategies'
    );

    loadingStrategies.value = false;
    return;
  }

  async function getExtendedStrategy(id: string) {
    if (extendedStrategies.value.some(st => st?.id === id))
      return extendedStrategies.value.find(st => st?.id === id);

    const strategyObj = await apolloQuery(
      {
        query: EXTENDED_STRATEGIES_QUERY
      },
      'strategies'
    );
    extendedStrategies.value = extendedStrategies.value.concat(strategyObj);

    return extendedStrategies.value.find(st => st?.id === id);
  }

  return {
    filterStrategies,
    getStrategies,
    getExtendedStrategy,
    strategies,
    extendedStrategies,
    loadingStrategies
  };
}
