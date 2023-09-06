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

type Address = `0x${string}`;

export type EASConfig = {
  EASDeployment: Address;
  SchemaRegistry: Address;
};

export const EASNetworks: Record<number, EASConfig> = {
  // Mainnet
  1: {
    EASDeployment: '0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587',
    SchemaRegistry: '0xA7b39296258348C78294F95B872b282326A97BDF'
  },
  // Arbitrum One
  42161: {
    EASDeployment: '0xbD75f629A22Dc1ceD33dDA0b68c546A1c035c458',
    SchemaRegistry: '0xA310da9c5B885E7fb3fbA9D66E9Ba6Df512b78eB'
  },
  // Sepolia Testnet
  421611: {
    EASDeployment: '0xC2679fBD37d54388Ce493F1DB75320D236e1815e',
    SchemaRegistry: '0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0'
  },
  // Optimism
  10: {
    EASDeployment: '0x4200000000000000000000000000000000000021',
    SchemaRegistry: '0x4200000000000000000000000000000000000020'
  },
  // Optimism Testnet Goerli
  420: {
    EASDeployment: '0x4200000000000000000000000000000000000021',
    SchemaRegistry: '0x4200000000000000000000000000000000000020'
  },
  // Goerli
  5: {
    EASDeployment: '0xAcfE09Fd03f7812F022FBf636700AdEA18Fd2A7A',
    SchemaRegistry: '0x720c2bA66D19A725143FBf5fDC5b4ADA2742682E'
  }
};
