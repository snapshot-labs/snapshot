import strategies from '@snapshot-labs/snapshot.js/src/strategies';

export default Object.fromEntries(
  Object.keys(strategies).map(name => {
    const strategy = strategies[name];
    strategy.key = name;
    return [name, strategy];
  })
);
