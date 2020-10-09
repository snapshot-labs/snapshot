const requireFile = require.context(
  '@bonustrack/snapshot-spaces/spaces/',
  true,
  /[\w-]+\.scss$/
);

requireFile.keys().map(file => requireFile(file));
