import { Network, Token } from '../types';

export const ETHEREUM_COIN = {
  name: 'Ether',
  decimals: 18,
  symbol: 'ETH',
  logoUri:
    'https://safe-transaction-assets.safe.global/chains/1/currency_logo.png',
  address: 'main'
} as const;

export const MATIC_COIN = {
  name: 'MATIC',
  decimals: 18,
  symbol: 'MATIC',
  address: 'main',
  logoUri:
    'https://safe-transaction-assets.safe.global/chains/137/currency_logo.png'
} as const;

const EWC_COIN = {
  name: 'Energy Web Token',
  symbol: 'EWT',
  address: 'main',
  decimals: 18,
  logoUri:
    'https://safe-transaction-assets.safe.global/chains/246/currency_logo.png'
} as const;

const XDAI_COIN = {
  name: 'XDAI',
  symbol: 'XDAI',
  address: 'main',
  decimals: 18,
  logoUri:
    'https://safe-transaction-assets.safe.global/chains/100/currency_logo.png'
} as const;
const BNB_COIN = {
  name: 'BNB',
  symbol: 'BNB',
  address: 'main',
  decimals: 18,
  logoUri:
    'https://safe-transaction-assets.safe.global/chains/56/currency_logo.png'
} as const;
const CORE_COIN = {
  name: 'Core',
  symbol: 'CORE',
  address: 'main',
  decimals: 18,
  logiUri:
    'https://cloudflare-ipfs.com/ipfs/bafkreigjv5yb7uhlrryzib7j2f73nnwqan2tmfnwjdu26vkk365fyesoiu'
} as const;

export function getNativeAsset(network: Network) {
  switch (parseInt(network)) {
    case 137:
    case 80001:
      return MATIC_COIN;
    case 100:
      return XDAI_COIN;
    case 246:
      return EWC_COIN;
    case 56:
      return BNB_COIN;
    case 1116:
      return CORE_COIN;
  }

  return ETHEREUM_COIN;
}

export function isNativeAsset(token: Token | undefined) {
  return token ? token.address === 'main' : false;
}
