import { ref } from 'vue';
import snapshot from '@snapshot-labs/snapshot.js';
import { getTokenBalances, ETHER_CONTRACT } from '@/helpers/covalent';
import { TreasuryAsset } from '@/helpers/interfaces';

const TOKEN_LIST_URL = 'https://tokenlist.zerion.eth.link/';

const zerionTokenListAddresses = ref<null | string[]>(null);

export function useTreasury() {
  async function loadTokenList() {
    if (zerionTokenListAddresses.value) return;
    const response = await snapshot.utils.getJSON(TOKEN_LIST_URL);
    zerionTokenListAddresses.value = [
      ETHER_CONTRACT,
      ...response.tokens.map(token => token.address)
    ];
  }

  async function getFilteredTokenBalances(address) {
    try {
      await loadTokenList();
      if (!zerionTokenListAddresses.value)
        throw new Error('Token list not found');

      const tokenBalancesWithoutZero: TreasuryAsset[] | null =
        await getTokenBalances(address);
      if (!tokenBalancesWithoutZero) return null;

      return tokenBalancesWithoutZero.filter(item =>
        zerionTokenListAddresses.value?.includes(item.contract_address)
      );
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  return { getFilteredTokenBalances };
}
