/**
 * Orders skins by spaces count and returns a list of skins
 * filtered by the search string (case insensitive).
 */

import { ref } from 'vue';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { SKINS_COUNT_QUERY } from '@/helpers/queries';
import skins from '@/../snapshot-spaces/skins';

const skinsSpacesCount: any = ref(null);

export function useSkinsFilter() {
  const loading = ref(false);

  const filterSkins = (q = '') =>
    Object.keys(skins)
      .filter(s => s.toLowerCase().includes(q.toLowerCase()))
      .sort(
        (a, b) =>
          (skinsSpacesCount.value[b] ?? 0) - (skinsSpacesCount.value[a] ?? 0)
      );

  const { apolloQuery } = useApolloQuery();

  async function getSkinsSpacesCount() {
    if (skinsSpacesCount.value) return;
    loading.value = true;
    const res = await apolloQuery(
      {
        query: SKINS_COUNT_QUERY
      },
      'skins'
    );
    skinsSpacesCount.value = res.reduce(
      (obj: any, item: any) => ({ ...obj, [item.id]: item.spacesCount }),
      {}
    );

    loading.value = false;
  }

  return {
    filterSkins,
    getSkinsSpacesCount,
    skinsSpacesCount,
    loadingSkins: loading
  };
}
