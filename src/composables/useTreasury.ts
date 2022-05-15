import { ref } from 'vue';
import snapshot from '@snapshot-labs/snapshot.js';
import { getTokenBalances, ETHER_CONTRACT } from '@/helpers/covalent';
import { TreasuryAsset } from '@/helpers/interfaces';

const TOKEN_LIST_URL = 'https://gateway.ipfs.io/ipns/tokens.uniswap.org';

const tokenListContractAddresses = ref<null | string[]>(null);
const treasuryAssets = ref<{ [key: string]: TreasuryAsset[] }>({});

export function useTreasury() {
  async function loadTokenList() {
    if (tokenListContractAddresses.value) return;
    const response = await snapshot.utils.getJSON(TOKEN_LIST_URL);
    tokenListContractAddresses.value = [
      ETHER_CONTRACT,
      ...response.tokens.map(token => token.address.toLowerCase())
    ];
  }

  async function loadFilteredTokenBalances(addresses: string[]) {
    try {
      await loadTokenList();
      if (!tokenListContractAddresses.value)
        throw new Error('Token list not found');

      // Get token balances for each address with a 1 second timeout
      // to avoid hitting the covalent API rate limit
      for (const address of addresses) {
        if (treasuryAssets.value[address]) return;
        const balances = await getTokenBalances(address)
          .then(balances =>
            balances?.filter(balance =>
              tokenListContractAddresses.value?.includes(
                balance.contract_address
              )
            )
          )
          .catch(() => []);
        if (balances) treasuryAssets.value[address] = balances;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(error);
    }
  }

  return { loadFilteredTokenBalances, treasuryAssets };
}
