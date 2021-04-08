const requireFile = require.context('./', true, /[\w-]+\.json$/);

export default Object.fromEntries(
  requireFile
    .keys()
    .map(fileName => [
      fileName.replace('./', '').replace('.json', ''),
      requireFile(fileName)
    ])
);
