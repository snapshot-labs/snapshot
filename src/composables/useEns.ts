import { ref } from 'vue';
import { useApolloQuery } from '@/composables/useApolloQuery';
import {
  ENS_DOMAINS_BY_ACCOUNT_QUERY,
  ENS_DOMAIN_BY_HASH_QUERY
} from '@/helpers/queries';
import { useWeb3 } from '@/composables/useWeb3';

export function useEns() {
  const validEnsTlds = ['eth', 'xyz', 'com', 'org', 'io', 'app', 'art'];

  const { ensApolloQuery } = useApolloQuery();
  const { web3Account } = useWeb3();

  const ownedEnsDomains = ref<Record<string, any>[]>([]);

  const loadOwnedEnsDomains = async () => {
    if (web3Account.value) {
      const res = await ensApolloQuery({
        query: ENS_DOMAINS_BY_ACCOUNT_QUERY,
        variables: {
          id: web3Account.value.toLowerCase()
        }
      });

      // The ens subgraph returns only the hash for domain TLDs other than .eth, so we
      // have to make a second request to fetch the actual domain.
      ownedEnsDomains.value = await Promise.all(res.account?.domains.map(async domain => {
        const hash = domain.name.match(/\[(.*?)\]/)?.[1];
        if (hash) {
          const res = await ensApolloQuery({
            query: ENS_DOMAIN_BY_HASH_QUERY,
            variables: {
              id: `0x${hash}`
            }
          });
          if (res.registration?.domain?.labelName) {
            return {
              ...domain,
              name: domain.name.replace(`[${hash}]`, res.registration.domain.labelName),
            };
          }
        }

        return domain;
      })) || [];
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
