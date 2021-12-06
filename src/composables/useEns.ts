import { useWeb3 } from './useWeb3';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { ENS_QUERY } from '@/helpers/queries';

export function useEns() {
  const { web3 } = useWeb3();
  const { ensApolloQuery } = useApolloQuery();

  async function getEnsNames() {
    const res = await ensApolloQuery({
      query: ENS_QUERY,
      variables: {
        id: web3.value.account.toLowerCase()
      }
    });

    return res;
  }

  return {
    getEnsNames
  };
}
