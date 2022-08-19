import { computed, reactive } from 'vue';
import { TokenAsset, SafeExecutionStatus } from '@/plugins/safeSnap/interfaces';

const GNOSIS_SAFE_TRANSACTION_API_URLS = {
  '1': 'https://safe-transaction.gnosis.io/api/v1/',
  '4': 'https://safe-transaction.rinkeby.gnosis.io/api/v1/',
  '100': 'https://safe-transaction.xdai.gnosis.io/api/v1/',
  '73799': 'https://safe-transaction.volta.gnosis.io/api/v1/',
  '246': 'https://safe-transaction.ewc.gnosis.io/api/v1/',
  '137': 'https://safe-transaction.polygon.gnosis.io/api/v1/',
  '56': 'https://safe-transaction.bsc.gnosis.io/api/v1/',
  '42161': 'https://safe-transaction.arbitrum.gnosis.io/api/v1/'
};

async function callGnosisSafeTransactionApi(network: string, url: string) {
  const apiUrl = GNOSIS_SAFE_TRANSACTION_API_URLS[network];
  const response = await fetch(apiUrl + url);
  return response.json();
}

const getGnosisSafeBalances = (network: string, safeAddress: string) => {
  const endpointPath = `/safes/${safeAddress}/balances/`;
  return callGnosisSafeTransactionApi(network, endpointPath);
};

const getGnosisSafeCollectibles = (network: string, safeAddress: string) => {
  const endpointPath = `/safes/${safeAddress}/collectibles/`;
  return callGnosisSafeTransactionApi(network, endpointPath);
};

const getGnosisSafeToken = async (
  network: string,
  tokenAddress: string
): Promise<TokenAsset> => {
  const endpointPath = `/tokens/${tokenAddress}`;
  return callGnosisSafeTransactionApi(network, endpointPath);
};

const state = reactive<SafeExecutionStatus>({
  batchError: undefined
});

export function useSafe() {
  function setBatchError(num: number, message: string) {
    state.batchError = { num, message };
  }

  function clearBatchError() {
    state.batchError = undefined;
  }

  return {
    getGnosisSafeBalances,
    getGnosisSafeCollectibles,
    getGnosisSafeToken,
    setBatchError,
    clearBatchError,
    safesnap: computed(() => state)
  };
}
