export const EXCLUDED_TOKENS = [
  {
    symbol: 'default',
    '1': '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    '11155111': '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    '137': '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
  },
  {
    symbol: 'USDT',
    '1': '0xdac17f958d2ee523a2206206994597c13d831ec7',
    '137': '0xc2132d05d31c914a87c6611c10748aeb04b58e8f'
  },
  {
    symbol: 'USDC',
    '1': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    '137': '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359'
  },
  {
    symbol: 'DAI',
    '1': '0x6b175474e89094c44da98b954eedeac495271d0f',
    '137': '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063'
  },
  {
    symbol: 'FDUSD',
    '1': '0xc5f0f7b66764f6ec8c8dff7ba683102295e16409',
    '137': ''
  },
  {
    symbol: 'TUSD',
    '1': '0x0000000000085d4780b73119b644ae5ecd22b376',
    '137': ''
  },
  {
    symbol: 'FRAX',
    '1': '0x853d955acef822db058eb8505911ed77f175b99e',
    '137': '0x45c32fa6df82ead1e2ef74d17b76547eddfaff89'
  },
  {
    symbol: 'GUSD',
    '1': '0x056fd409e1d7a124bd7017459dfea2f387b6d5cd',
    '137': ''
  },
  {
    symbol: 'PYUSD',
    '1': '0x6c3ea9036406852006290770bedfcaba0e23a0e8',
    '137': ''
  },
  {
    symbol: 'sUSD',
    '1': '0x57ab1ec28d129707052df4df418d58a2d46d5f51',
    '137': ''
  },
  {
    symbol: 'USDP',
    '1': '0x8e870d67f660d95d5be530380d0ec0bd388289e1',
    '137': ''
  },
  {
    symbol: 'LUSD',
    '1': '0x5f98805a4e8be255a32880fdec7f6728c6568ba0',
    '137': '0x23001f892c0c82b79303edc9b9033cd190bb21c7'
  },
  {
    symbol: 'WBTC',
    '1': '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    '137': '0x1bfd67037b42cf73acF2047067bd4F2C47D9BfD6'
  },

  {
    symbol: 'WETH',
    '1': '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    '11155111': '0x7b79995e5f793a07bc00c21412e50ecae098e7f9',
    '137': '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619'
  },
  {
    symbol: 'STETH',
    '1': '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
    '137': ''
  },
  {
    symbol: 'WSTETH',
    '1': '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
    '137': '0x03b54a6e9a984069379fae1a4fc4dbae93b3bccd'
  },
  {
    symbol: 'CBETH',
    '1': '0xbe9895146f7af43049ca1c1ae358b0541ea49704',
    '137': '0x4b4327db1600b8b1440163f667e199cef35385f5'
  },
  {
    symbol: 'ANKRETH',
    '1': '0xe95a203b1a91a908f9b9ce46459d101078c2c3cb',
    '137': ''
  },
  {
    symbol: 'OSETH',
    '1': '0xf1c9acdc66974dfb6decb12aa385b9cd01190e38',
    '137': ''
  }
];

export function isExcludedToken(chainId: string, contractAddress: string) {
  return (
    EXCLUDED_TOKENS.find(token => token?.[chainId] === contractAddress) !==
    undefined
  );
}
