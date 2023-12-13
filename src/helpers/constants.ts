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

export const KNOWN_HOSTS = ['app.safe.global', 'pilot.gnosisguild.org'];

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
