const requireFile = require.context(
  '@bonustrack/snapshot-spaces/skins/',
  true,
  /[\w-]+\.scss$/
);

requireFile.keys().map(file => requireFile(file));
