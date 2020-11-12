const requireFile = require.context(
  '@snapshot-labs/snapshot.js/src/strategies',
  true,
  /index\.js$/
);

export default Object.fromEntries(
  requireFile
    .keys()
    .filter(fileName => fileName !== './index.js')
    .map(fileName => {
      const key = fileName.replace('./', '').replace('/index.js', '');
      const strategy = requireFile(fileName);
      strategy.key = key;
      return [key, strategy];
    })
);
