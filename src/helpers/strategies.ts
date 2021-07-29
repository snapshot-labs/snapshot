import strategies from '@snapshot-labs/snapshot.js/src/strategies';

export default Object.fromEntries(
  Object.keys(strategies).map(strategyName => {
    const strategy = strategies[strategyName];
    strategy.key = strategyName;
    return [name, strategy];
  })
);
