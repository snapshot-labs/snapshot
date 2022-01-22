import { ref } from 'vue';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { ENS_QUERY } from '@/helpers/queries';
import { useWeb3 } from '@/composables/useWeb3';

export function useEns() {
  const validEnsTlds = ['eth', 'xyz', 'com', 'org', 'io', 'app', 'art'];

  const { ensApolloQuery } = useApolloQuery();
  const { web3Account } = useWeb3();

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
    } else {
      ownedEnsDomains.value = [];
    }
  };

  function isValidEnsDomain(domain) {
    if (!domain.includes('.')) return false;
    return validEnsTlds.includes(domain.split('.').pop());
  }

  return {
    loadOwnedEnsDomains,
    ownedEnsDomains,
    validEnsTlds,
    isValidEnsDomain
  };
}
