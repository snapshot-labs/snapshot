type Metadata = {
  name: string;
  ticker?: string;
  chainId: number;
  apiUrl: string;
  avatar: string;
  blockTime: number;
};

export const METADATA: Record<string, Metadata> = {
  eth: {
    name: 'Ethereum',
    chainId: 1,
    apiUrl: 'https://api.studio.thegraph.com/query/23545/sx/version/latest',
    avatar:
      'ipfs://bafkreid7ndxh6y2ljw2jhbisodiyrhcy2udvnwqgon5wgells3kh4si5z4',
    blockTime: 12.09
  },
  gor: {
    name: 'Ethereum Goerli',
    chainId: 5,
    apiUrl:
      'https://api.studio.thegraph.com/query/23545/sx-goerli/version/latest',
    avatar:
      'ipfs://bafkreid7ndxh6y2ljw2jhbisodiyrhcy2udvnwqgon5wgells3kh4si5z4',
    blockTime: 15.52512
  },
  matic: {
    name: 'Polygon',
    ticker: 'MATIC',
    chainId: 137,
    apiUrl:
      'https://api.studio.thegraph.com/query/23545/sx-polygon/version/latest',
    avatar:
      'ipfs://bafkreihcx4zkpfjfcs6fazjp6lcyes4pdhqx3uvnjuo5uj2dlsjopxv5am',
    blockTime: 2.15812
  },
  arb1: {
    name: 'Arbitrum One',
    chainId: 42161,
    apiUrl: 'https://api.studio.thegraph.com/query/23545/sx-arbitrum/v0.0.17', // TODO: change to use latest, it's stuck syncing right now, hardcoding so we have working UI
    avatar:
      'ipfs://bafkreic2p3zzafvz34y4tnx2kaoj6osqo66fpdo3xnagocil452y766gdq',
    blockTime: 0.26082
  }
};

export const NETWORKS = {
  '1': {
    key: '1',
    chainId: 1,
    multicall: '0xeefba1e63905ef1d7acba5a8513c70307c1ce441',
    explorer: 'https://etherscan.io'
  },
  '5': {
    key: '5',
    chainId: 5,
    multicall: '0x77dca2c955b15e9de4dbbcf1246b4b85b651e50e',
    explorer: 'https://goerli.etherscan.io'
  },
  '137': {
    key: '137',
    chainId: 137,
    multicall: '0xCBca837161be50EfA5925bB9Cc77406468e76751',
    explorer: 'https://polygonscan.com'
  },
  '42161': {
    key: '42161',
    chainId: 42161,
    multicall: '0x7A7443F8c577d537f1d8cD4a629d40a3148Dd7ee',
    explorer: 'https://arbiscan.io'
  }
};
