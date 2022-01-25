/**
 * Get list of validations and order them by popularity
 * Filter list of validations by a search string
 */

import { computed, ref } from 'vue';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { VALIDATIONS_COUNT_QUERY } from '@/helpers/queries';
import validations from '@snapshot-labs/snapshot.js/src/validations';

const validationsSpacesCount: any = ref(null);

export function useValidations() {
  const loading = ref(false);

  const minifiedValidationsArray = computed(() =>
    Object.keys(validations).map((key: any) => ({
      name: key,
      spacesCount: validationsSpacesCount.value?.[key]
    }))
  );

  const filtereValidations = (q = '') =>
    minifiedValidationsArray.value
      .filter(v => JSON.stringify(v).toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.spacesCount - a.spacesCount);

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
    return;
  }
  return {
    minifiedValidationsArray,
    filtereValidations,
    getValidationsSpacesCount,
    loadingValidations: loading
  };
}
