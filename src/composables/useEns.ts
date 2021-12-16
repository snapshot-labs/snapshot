/**
 * Load a users domains from ENS subgraph.
 */

import { ref } from 'vue';
import { useWeb3 } from './useWeb3';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { ENS_QUERY } from '@/helpers/queries';

export function useEns() {
  const { web3Account } = useWeb3();
  const { ensApolloQuery } = useApolloQuery();

  const validEnsTlds = ['eth', 'xyz', 'com', 'org', 'io', 'app', 'art'];
  const ownedEnsDomains = ref([]);
  const loadOwnedEnsDomains = async () => {
    if (web3Account.value) {
      const res = await ensApolloQuery({
        query: ENS_QUERY,
        variables: {
          id: web3Account.value.toLowerCase()
        }
      });
      ownedEnsDomains.value = res.account?.domains || [];
    }
  };

  return {
    validEnsTlds,
    ownedEnsDomains,
    loadOwnedEnsDomains
  };
}
