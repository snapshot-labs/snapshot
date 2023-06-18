import { GNOSIS_SAFE_TRANSACTION_API_URLS } from '../constants';
import { TokenAsset } from '@/helpers/interfaces';
import memoize from 'lodash/memoize';

async function callGnosisSafeTransactionApi(
  network: keyof typeof GNOSIS_SAFE_TRANSACTION_API_URLS,
  url: string
) {
  const apiUrl = GNOSIS_SAFE_TRANSACTION_API_URLS[network];
  const response = await fetch(apiUrl + url);
  return response.json();
}

export const getGnosisSafeBalances = memoize(
  (network, safeAddress) => {
    const endpointPath = `/v1/safes/${safeAddress}/balances/`;
    return callGnosisSafeTransactionApi(network, endpointPath);
  },
  (safeAddress, network) => `${safeAddress}_${network}`
);

export const getGnosisSafeCollectibles = memoize(
  (network, safeAddress) => {
    const endpointPath = `/v2/safes/${safeAddress}/collectibles/`;
    return callGnosisSafeTransactionApi(network, endpointPath);
  },
  (safeAddress, network) => `${safeAddress}_${network}`
);

export const getGnosisSafeToken = memoize(
  async (network, tokenAddress): Promise<TokenAsset> => {
    const endpointPath = `/v1/tokens/${tokenAddress}`;
    return callGnosisSafeTransactionApi(network, endpointPath);
  },
  (tokenAddress, network) => `${tokenAddress}_${network}`
);
