/**
 * Get list of networks and order them by popularity
 * Filter list of networks by a search string
 */

import { computed, ref } from 'vue';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { NETWORKS_COUNT_QUERY } from '@/helpers/queries';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';

export function useNetworks() {
  const loading = ref(false);
  const networksSpacesCount: any = ref(null);

  const minifiedNetworksArray = computed(() =>
    Object.keys(networks).map(s => ({
      spacesCount: networksSpacesCount.value?.[s] ?? 0,
      ...networks[s]
    }))
  );

  const filtereNetworks = (q = '') =>
    minifiedNetworksArray.value
      .filter(n => !n.disabled)
      .filter(n => JSON.stringify(n).toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.spacesCount - a.spacesCount);

  const { apolloQuery } = useApolloQuery();

  async function getNetworksSpacesCount() {
    if (networksSpacesCount.value) return;
    loading.value = true;
    const res = await apolloQuery(
      {
        query: NETWORKS_COUNT_QUERY
      },
      'networks'
    );
    networksSpacesCount.value = res.reduce(
      (obj: any, item: any) => ({ ...obj, [item.id]: item.spacesCount }),
      {}
    );

    loading.value = false;
  }
  return {
    minifiedNetworksArray,
    filtereNetworks,
    getNetworksSpacesCount,
    loadingNetworks: loading
  };
}
