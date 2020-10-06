const requireSpace = require.context(
  '@bonustrack/snapshot-spaces/spaces/',
  true,
  /[\w-]+\.json$/
);
const requireSkin = require.context(
  '@bonustrack/snapshot-spaces/spaces/',
  true,
  /[\w-]+\.scss$/
);

requireSkin.keys().map(file => requireSkin(file));

export default Object.fromEntries(
  requireSpace
    .keys()
    .filter(
      file =>
        ![
          './domains.json',
          './homepage.json',
          './spotlight.json',
          './example/index.json'
        ].includes(file)
    )
    .map(file => {
      const space = requireSpace(file);
      const key = file.replace('./', '').replace('/index.json', '');
      const strategies = [
        [
          'erc20-balance-of',
          {
            address: space.address,
            decimals: space.decimals,
            symbol: space.symbol
          }
        ]
      ];
      return [
        key,
        { ...space, key, strategies: space.strategies || strategies }
      ];
    })
);
