import { GNOSIS_SAFE_TRANSACTION_API_URLS } from '../constants';
import { TokenAsset } from '../models';
import memoize from 'lodash/memoize';

async function callGnosisSafeTransactionApi(network: string, url: string) {
  const apiUrl = GNOSIS_SAFE_TRANSACTION_API_URLS[network];
  const response = await fetch(apiUrl + url);
  return response.json();
}

export const getGnosisSafeBalances = memoize(
  (network, safeAddress) => {
    const endpointPath = `/safes/${safeAddress}/balances/`;
    return callGnosisSafeTransactionApi(network, endpointPath);
  },
  (safeAddress, network) => `${safeAddress}_${network}`
);

export const getGnosisSafeCollectibles = memoize(
  (network, safeAddress) => {
    const endpointPath = `/safes/${safeAddress}/collectibles/`;
    return callGnosisSafeTransactionApi(network, endpointPath);
  },
  (safeAddress, network) => `${safeAddress}_${network}`
);

export const getGnosisSafeToken = memoize(
  async (network, tokenAddress): Promise<TokenAsset> => {
    const endpointPath = `/tokens/${tokenAddress}`;
    return callGnosisSafeTransactionApi(network, endpointPath);
  },
  (tokenAddress, network) => `${tokenAddress}_${network}`
);
