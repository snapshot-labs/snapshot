import {
  ENS_DOMAINS_BY_ACCOUNT_QUERY,
  ENS_DOMAIN_BY_HASH_QUERY
} from '@/helpers/queries';

const VALID_ENS_TLDS = ['eth', 'xyz', 'com', 'org', 'io', 'app', 'art'];

export function useEns() {
  const { ensApolloQuery } = useApolloQuery();
  const ownedEnsDomains = ref<Record<string, any>[]>([]);

  // Fetch owned ENS domains for a given address
  const loadOwnedEnsDomains = async (address: string) => {
    if (!address) {
      ownedEnsDomains.value = [];
      return;
    }

    const response = await ensApolloQuery({
      query: ENS_DOMAINS_BY_ACCOUNT_QUERY,
      variables: {
        id: address.toLowerCase()
      }
    });

    const domains = response.account?.domains || [];
    const wrappedDomains = response.account?.wrappedDomains || [];
    const allDomains = [...domains, ...wrappedDomains];

    ownedEnsDomains.value = await fetchAllDomainData(allDomains);
  };

  // Fetch data for all domains and handle hash-based TLDs
  async function fetchAllDomainData(domains: any[]) {
    const filteredDomains = domains.filter(
      domain => !domain.name.endsWith('.addr.reverse')
    );

    const domainPromises = filteredDomains.map(fetchDomainData);

    return (await Promise.all(domainPromises)) || [];
  }

  // Fetch data for a single domain and update the name if it's a hash-based TLD
  async function fetchDomainData(domain) {
    const hash = domain.name.match(/\[(.*?)\]/)?.[1];

    if (!hash) return domain;

    const response = await ensApolloQuery({
      query: ENS_DOMAIN_BY_HASH_QUERY,
      variables: {
        id: `0x${hash}`
      }
    });

    if (response.registration?.domain?.labelName) {
      return {
        ...domain,
        name: domain.name.replace(
          `[${hash}]`,
          response.registration.domain.labelName
        )
      };
    }

    return {
      ...domain,
      isInvalid: true
    };
  }

  // Check if a domain is valid based on the TLD
  function isValidEnsDomain(domain: string): boolean {
    if (!domain?.includes('.')) return false;
    return VALID_ENS_TLDS.includes(domain.split('.').pop() ?? '');
  }

  return {
    loadOwnedEnsDomains,
    ownedEnsDomains,
    validEnsTlds: VALID_ENS_TLDS,
    isValidEnsDomain
  };
}
