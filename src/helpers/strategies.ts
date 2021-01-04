const requireFile = require.context(
  '@snapshot-labs/snapshot.js/src/strategies',
  true,
  /index\.ts|README\.md$/
);

export default Object.fromEntries(
  requireFile
    .keys()
    .filter(fileName => fileName !== './index.ts')
    .map(fileName => {
      const key = fileName.replace('./', '').replace('/index.ts', '');
      const strategy = requireFile(fileName);
      strategy.key = key;
      try {
        strategy.description = requireFile(fileName.replace('index.ts', 'README.md')).default;
      } catch (error) {
        strategy.description = ""
      }
      return [key, strategy];
    })
);
