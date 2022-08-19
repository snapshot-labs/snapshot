import { GNOSIS_SAFE_TRANSACTION_API_URLS } from '../constants';
import { TokenAsset } from '@/plugins/safeSnap/interfaces';

async function callGnosisSafeTransactionApi(network: string, url: string) {
  const apiUrl = GNOSIS_SAFE_TRANSACTION_API_URLS[network];
  const response = await fetch(apiUrl + url);
  return response.json();
}

export const getGnosisSafeBalances = (network, safeAddress) => {
  const endpointPath = `/safes/${safeAddress}/balances/`;
  return callGnosisSafeTransactionApi(network, endpointPath);
};

export const getGnosisSafeCollectibles = (network, safeAddress) => {
  const endpointPath = `/safes/${safeAddress}/collectibles/`;
  return callGnosisSafeTransactionApi(network, endpointPath);
};

export const getGnosisSafeToken = async (
  network,
  tokenAddress
): Promise<TokenAsset> => {
  const endpointPath = `/tokens/${tokenAddress}`;
  return callGnosisSafeTransactionApi(network, endpointPath);
};
