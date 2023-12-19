import { ETH_CONTRACT } from '@/helpers/constants';
import {
  GetTokenBalancesResponse,
  GetTokensMetadataResponse,
  GetBalancesResponse
} from './types';
export * from './types';

const apiKey = import.meta.env.VITE_ALCHEMY_API_KEY;

const NETWORKS = {
  1: 'eth-mainnet',
  11155111: 'eth-sepolia',
  137: 'polygon-mainnet',
  42161: 'arb-mainnet'
};

function getApiUrl(networkId: number) {
  const network = NETWORKS[networkId] ?? 'mainnet';

  return `https://${network}.g.alchemy.com/v2/${apiKey}`;
}

export async function request(
  method: string,
  params: any[],
  networkId: number
) {
  const res = await fetch(getApiUrl(networkId), {
    method: 'POST',
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method,
      params
    })
  });

  const { result } = await res.json();

  return result;
}

export async function batchRequest(
  requests: { method: string; params: any[] }[],
  networkId: number
) {
  const res = await fetch(getApiUrl(networkId), {
    method: 'POST',
    body: JSON.stringify(
      requests.map((request, i) => ({
        id: i,
        jsonrpc: '2.0',
        method: request.method,
        params: request.params
      }))
    )
  });

  const response = await res.json();

  return response.map(entry => entry.result);
}

/**
 * Gets Ethereum balance as hex encoded string.
 * @param address Ethereum address to fetch ETH balance for
 * @param networkId Network ID
 * @returns Hex encoded ETH balance
 */
export async function getBalance(
  address: string,
  networkId: number
): Promise<string> {
  return request('eth_getBalance', [address], networkId);
}

/**
 * Gets ERC20 balances of tokens that provided address interacted with.
 * Response might include 0 balances.
 * @param address Ethereum address to fetch token balances for
 * @param networkId Network ID
 * @returns Token balances
 */
export async function getTokenBalances(
  address: string,
  networkId: number
): Promise<GetTokenBalancesResponse> {
  return request('alchemy_getTokenBalances', [address], networkId);
}

/**
 * Gets ERC20 tokens metadata (name, symbol, decimals, logo).
 * @param addresses Array of ERC20 tokens addresses
 * @param networkId Network ID
 * @returns Array of token metadata
 */
export async function getTokensMetadata(
  addresses: string[],
  networkId: number
): Promise<GetTokensMetadataResponse> {
  return batchRequest(
    addresses.map(address => ({
      method: 'alchemy_getTokenMetadata',
      params: [address]
    })),
    networkId
  );
}

/**
 * Gets Ethereum and ERC20 balances including metadata for tokens.
 * @param address Ethereum address to fetch balances for
 * @param networkId Network ID
 * @returns Array of balances
 */
export async function getBalances(
  address: string,
  networkId: number,
  baseToken: { name: string; symbol: string; logo?: string }
): Promise<GetBalancesResponse> {
  if (!address) {
    return [
      {
        name: baseToken.name,
        symbol: baseToken.symbol,
        decimals: 18,
        contractAddress: ETH_CONTRACT,
        tokenBalance: '0x0',
        price: 0,
        value: 0,
        change: 0
      }
    ];
  }

  const [ethBalance, { tokenBalances }] = await Promise.all([
    getBalance(address, networkId),
    getTokenBalances(address, networkId)
  ]);

  const contractAddresses = tokenBalances.map(
    balance => balance.contractAddress
  );
  const metadata = await getTokensMetadata(contractAddresses, networkId);

  return [
    {
      name: baseToken.name,
      symbol: baseToken.symbol,
      decimals: 18,
      contractAddress: ETH_CONTRACT,
      tokenBalance: ethBalance,
      price: 0,
      value: 0,
      change: 0
    },
    ...tokenBalances
      .map((balance, i) => ({
        ...balance,
        ...metadata[i],
        price: 0,
        value: 0,
        change: 0
      }))
      .filter(token => !token.symbol?.includes('.'))
  ];
}
