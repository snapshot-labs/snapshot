import { TokenAsset } from '@/helpers/interfaces';
import { Network } from '../types';

export const ETHEREUM_COIN: TokenAsset = {
  name: 'Ether',
  decimals: 18,
  symbol: 'ETH',
  logoUri:
    'https://safe-transaction-assets.safe.global/chains/1/currency_logo.png',
  address: 'main'
};
export const MATIC_COIN: TokenAsset = {
  name: 'MATIC',
  decimals: 18,
  symbol: 'MATIC',
  address: 'main',
  logoUri:
    'https://safe-transaction-assets.safe.global/chains/137/currency_logo.png'
};
const EWC_COIN: TokenAsset = {
  name: 'Energy Web Token',
  symbol: 'EWT',
  address: 'main',
  decimals: 18,
  logoUri:
    'https://safe-transaction-assets.safe.global/chains/246/currency_logo.png'
};
const XDAI_COIN: TokenAsset = {
  name: 'XDAI',
  symbol: 'XDAI',
  address: 'main',
  decimals: 18,
  logoUri:
    'https://safe-transaction-assets.safe.global/chains/100/currency_logo.png'
};
const BNB_COIN: TokenAsset = {
  name: 'BNB',
  symbol: 'BNB',
  address: 'main',
  decimals: 18,
  logoUri:
    'https://safe-transaction-assets.safe.global/chains/56/currency_logo.png'
};
const CORE_COIN: TokenAsset = {
  name: 'Core',
  symbol: 'CORE',
  address: 'main',
  decimals: 18,
  logoUri:
    'https://cloudflare-ipfs.com/ipfs/bafkreigjv5yb7uhlrryzib7j2f73nnwqan2tmfnwjdu26vkk365fyesoiu'
};

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
