const harmonyStrategy = async (
  space,
  network,
  provider,
  addresses,
  options,
  snapshot
) => {
  const res = Object.fromEntries(
    addresses.map((value, i) => [addresses[i], 18])
  );

  return Promise.resolve(res);
};

export async function getScores(
  space: string,
  strategies: any[],
  network: string,
  provider,
  addresses: string[],
  snapshot = 'latest'
) {
  return [
    await harmonyStrategy(space, network, provider, addresses, {}, snapshot)
  ];
}
