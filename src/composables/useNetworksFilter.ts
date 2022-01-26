/**
 * Orders networks by spaces count and returns a list of networks
 * filtered by the search string (case insensitive).
 */

import { ref } from 'vue';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { NETWORKS_COUNT_QUERY } from '@/helpers/queries';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';

const networksSpacesCount: any = ref(null);

export function useNetworksFilter() {
  const loading = ref(false);

  const filterNetworks = (q = '') =>
    Object.keys(networks)
      .map(s => ({ ...networks[s] }))
      .filter(n => !n.disabled)
      .filter(n => JSON.stringify(n).toLowerCase().includes(q.toLowerCase()))
      .sort(
        (a, b) =>
          (networksSpacesCount.value?.[b.key] ?? 0) -
          (networksSpacesCount.value?.[a.key] ?? 0)
      );

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
    filterNetworks,
    getNetworksSpacesCount,
    networksSpacesCount,
    loadingNetworks: loading
  };
}
