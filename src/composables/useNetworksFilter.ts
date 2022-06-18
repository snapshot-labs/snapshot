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

  const filterNetworks = (q = '') => {
    const networksArray = Object.keys(networks)
      .map(s => ({ ...networks[s] }))
      .filter(n => !n.disabled);

    const networksArrayBySearchString = networksArray.filter(n =>
      JSON.stringify(n).toLowerCase().includes(q.toLowerCase())
    );

    const networksArrayBySpaceCount = networksArrayBySearchString.sort(
      (a, b) =>
        (networksSpacesCount.value?.[b.key] ?? 0) -
        (networksSpacesCount.value?.[a.key] ?? 0)
    );

    const networksArrayByExactKeyMatch = networksArrayBySpaceCount.sort(
      (a, b) => (a.key === q ? -1 : b.key === q ? 1 : 0)
    );

    const networksArrayTestnetworksLast = networksArrayByExactKeyMatch.sort(
      (a, b) =>
        a.name.toLowerCase().includes('testnet')
          ? 1
          : b.name.toLowerCase().includes('testnet')
          ? -1
          : 0
    );

    return networksArrayTestnetworksLast;
  };

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
    loadingNetworksSpacesCount: loading
  };
}
