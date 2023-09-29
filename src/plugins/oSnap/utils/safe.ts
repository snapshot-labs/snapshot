import memoize from 'lodash/memoize';
import { GNOSIS_SAFE_TRANSACTION_API_URLS } from '../constants';
import { BalanceResponse, NFT, Network, Token } from '../types';

async function callGnosisSafeTransactionApi<TResult = any>(
  network: Network,
  url: string
) {
  const apiUrl = GNOSIS_SAFE_TRANSACTION_API_URLS[network];
  const response = await fetch(apiUrl + url);
  return response.json() as TResult;
}

export const getGnosisSafeBalances = memoize(
  (network: Network, safeAddress: string) => {
    const endpointPath = `/v1/safes/${safeAddress}/balances/`;
    return callGnosisSafeTransactionApi<Partial<BalanceResponse>[]>(network, endpointPath);
  },
  (safeAddress, network) => `${safeAddress}_${network}`
);

export const getGnosisSafeCollectibles = memoize(
  (network: Network, safeAddress: string) => {
    const endpointPath = `/v2/safes/${safeAddress}/collectibles/`;
    type Result = {
      count: number;
      next: unknown;
      previous: unknown;
      results: NFT[];
    }
    return callGnosisSafeTransactionApi<Result>(network, endpointPath);
  },
  (safeAddress, network) => `${safeAddress}_${network}`
);

export const getGnosisSafeToken = memoize(
  async (network, tokenAddress): Promise<Token> => {
    const endpointPath = `/v1/tokens/${tokenAddress}`;
    return callGnosisSafeTransactionApi(network, endpointPath);
  },
  (tokenAddress, network) => `${tokenAddress}_${network}`
);
