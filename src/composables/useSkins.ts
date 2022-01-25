/**
 * Get list of skins and order them by popularity
 * Filter list of skins by a search string
 */

import { computed, ref } from 'vue';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { SKINS_COUNT_QUERY } from '@/helpers/queries';
import skins from '@/../snapshot-spaces/skins';

const skinsSpacesCount: any = ref(null);

export function useSkins() {
  const loading = ref(false);

  const minifiedSkinsArray = computed(() =>
    Object.keys(skins).map(s => ({
      key: s,
      spacesCount: skinsSpacesCount.value?.[s] ?? 0
    }))
  );

  const filtereSkins = (q = '') =>
    minifiedSkinsArray.value
      .filter(s => s.key.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.spacesCount - a.spacesCount);

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
    minifiedSkinsArray,
    filtereSkins,
    getSkinsSpacesCount,
    loadingSkins: loading
  };
}
