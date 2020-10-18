const requireFile = require.context(
  '@snapshot-labs/snapshot-spaces/skins/',
  true,
  /[\w-]+\.scss$/
);

requireFile.keys().map(file => requireFile(file));

export default requireFile
  .keys()
  .map(file => file.replace('./', '').replace('.scss', ''));
