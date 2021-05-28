const requireFile = require.context(
  '@snapshot-labs/snapshot.js/src/strategies',
  true,
  /index\.ts$/
);

const requireReadmeFile = require.context(
  '@snapshot-labs/snapshot.js/src/strategies',
  true,
  /README\.md$/
);

const requireExamplesJson = require.context(
  '@snapshot-labs/snapshot.js/src/strategies',
  true,
  /examples\.json$/
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
        strategy.examples = requireExamplesJson(
          fileName.replace('index.ts', 'examples.json')
        ).default;
        strategy.about = requireReadmeFile(
          fileName.replace('index.ts', 'README.md')
        ).default;
      } catch (error) {
        strategy.about = '';
      }
      try {
        strategy.examples = requireExamplesJson(
          fileName.replace('index.ts', 'examples.json')
        );
      } catch (error) {
        strategy.examples = null;
      }
      return [key, strategy];
    })
);
