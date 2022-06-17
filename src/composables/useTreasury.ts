import { computed, ref } from 'vue';
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

  const loading = ref(false);

  async function loadFilteredTokenBalances(address: string, chainId: string) {
    loading.value = true;
    try {
      await loadTokenList();
      if (!tokenListContractAddresses.value)
        throw new Error('Token list not found');

      if (treasuryAssets.value[address]) return;
      const balances = await getTokenBalances(address, chainId)
        .then(balances =>
          balances?.filter(balance =>
            tokenListContractAddresses.value?.includes(balance.contract_address)
          )
        )
        .catch(() => []);
      if (balances) treasuryAssets.value[address] = balances;
    } catch (error) {
      console.error(error);
    } finally {
      loading.value = false;
    }
  }

  function resetTreasuryAssets() {
    treasuryAssets.value = {};
  }

  return {
    loadFilteredTokenBalances,
    resetTreasuryAssets,
    treasuryAssets: computed(() => treasuryAssets.value),
    loadingBalances: computed(() => loading.value)
  };
}
