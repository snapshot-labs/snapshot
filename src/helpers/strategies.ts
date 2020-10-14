const requireFile = require.context(
  '@bonustrack/snapshot.js/src/strategies',
  true,
  /index\.ts$/
);

export default Object.fromEntries(
  requireFile
    .keys()
    .filter(fileName => fileName !== './index.ts')
    .map(fileName => {
      const key = fileName.replace('./', '').replace('/index.ts', '');
      const strategy = requireFile(fileName);
      strategy.key = key;
      return [key, strategy];
    })
);
