export const ETH_CONTRACT = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

export const DEFAULT_ETH_ADDRESS = '0x0000000000000000000000000000000000000000';

export const SNAPSHOT_BREAKPOINTS = {
  xs: '420px',
  sm: '544px',
  md: '768px',
  lg: '1012px',
  xl: '1280px',
  '2xl': '1536px'
};

export const KNOWN_HOSTS = [
  'app.safe.global',
  'pilot.gnosisguild.org',
  'metissafe.tech'
];

export const SPACE_CATEGORIES = [
  'protocol',
  'social',
  'investment',
  'grant',
  'service',
  'media',
  'creator',
  'collector'
];

export const ERC20ABI = [
  'function name() public view returns (string)',
  'function decimals() view returns (uint32)',
  'function symbol() view returns (string)',
  'function balanceOf(address) view returns (uint256)'
];

export const COINGECKO_ASSET_PLATFORMS = {
  137: 'polygon-pos',
  42161: 'arbitrum-one'
};

export const COINGECKO_BASE_ASSETS = {
  137: 'matic-network',
  42161: 'ethereum'
};

export const BOOST_ADDRESS = '0xaf8b6af86044821eED74E49057De62fB5C48e061';

export const SNAPSHOT_GUARD_ADDRESS =
  '0xF63EB3f569C6cB8F5Cf37caD183790Ed1b251c91';

export const GUARDS = {
  '0xF63EB3f569C6cB8F5Cf37caD183790Ed1b251c91': 'Snapshot Labs'
};

type ChainCurrencies = {
  name: string;
  symbol: string;
  decimals: number;
  contractAddress: string;
};

export const CHAIN_CURRENCIES: Record<string, ChainCurrencies> = {
  '1': {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
    contractAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
  },
  '5': {
    name: 'Goerli Ether',
    symbol: 'GoerliETH',
    decimals: 18,
    contractAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
  },
  '137': {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
    contractAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
  },
  '42161': {
    name: 'Arbitrum',
    symbol: 'ARB',
    decimals: 18,
    contractAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
  }
};
