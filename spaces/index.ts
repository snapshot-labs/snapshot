const requireSpace = require.context('./', true, /[\w-]+\.json$/);
const requireSkin = require.context('./', true, /[\w-]+\.scss$/);

requireSkin.keys().map(file => requireSkin(file));

export default Object.fromEntries(requireSpace.keys()
  .filter(file => !['./domains.json', './homepage.json', './example/index.json'].includes(file))
  .map(file => {
    const space = requireSpace(file);
    return [space.key, space];
  })
);
