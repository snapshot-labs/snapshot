import { TokenAsset } from '../models';

export const ETHEREUM_COIN: TokenAsset = {
  name: 'Ether',
  decimals: 18,
  symbol: 'ETH',
  logoUri:
    'https://safe-transaction-assets.gnosis-safe.io/chains/1/currency_logo.png',
  address: 'main'
};
export const MATIC_COIN: TokenAsset = {
  name: 'MATIC',
  decimals: 18,
  symbol: 'MATIC',
  address: 'main',
  logoUri:
    'https://safe-transaction-assets.gnosis-safe.io/chains/137/currency_logo.png'
};
const EWC_COIN: TokenAsset = {
  name: 'Energy Web Token',
  symbol: 'EWT',
  address: 'main',
  decimals: 18,
  logoUri:
    'https://safe-transaction-assets.gnosis-safe.io/chains/246/currency_logo.png'
};
const XDAI_COIN: TokenAsset = {
  name: 'XDAI',
  symbol: 'XDAI',
  address: 'main',
  decimals: 18,
  logoUri:
    'https://safe-transaction-assets.gnosis-safe.io/chains/100/currency_logo.png'
};
const BNB_COIN: TokenAsset = {
  name: 'BNB',
  symbol: 'BNB',
  address: 'main',
  decimals: 18,
  logoUri:
    'https://safe-transaction-assets.gnosis-safe.io/chains/56/currency_logo.png'
};

export function getNativeAsset(network) {
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
  }

  return ETHEREUM_COIN;
}
