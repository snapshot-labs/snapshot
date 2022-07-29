/**
 * Get list of validations and order them by popularity
 * Filter list of validations by a search string
 */

import { ref } from 'vue';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { VALIDATIONS_COUNT_QUERY } from '@/helpers/queries';
import validations from '@snapshot-labs/snapshot.js/src/validations';

const validationsSpacesCount: any = ref(null);

export function useValidationsFilter() {
  const loading = ref(false);

  const filterValidations = (q = ''): string[] =>
    Object.keys(validations)
      .filter(v => JSON.stringify(v).toLowerCase().includes(q.toLowerCase()))
      .sort(
        (a, b) =>
          (validationsSpacesCount.value?.[b] ?? 0) -
          (validationsSpacesCount.value?.[a] ?? 0)
      );

  const { apolloQuery } = useApolloQuery();

  async function getValidationsSpacesCount() {
    if (validationsSpacesCount.value) return;
    loading.value = true;
    const res = await apolloQuery(
      {
        query: VALIDATIONS_COUNT_QUERY
      },
      'validations'
    );
    validationsSpacesCount.value = res.reduce(
      (obj: any, item: any) => ({ ...obj, [item.id]: item.spacesCount }),
      {}
    );
    loading.value = false;
  }

  return {
    filterValidations,
    getValidationsSpacesCount,
    validationsSpacesCount,
    loadingValidations: loading
  };
}
