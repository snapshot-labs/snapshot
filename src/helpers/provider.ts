import { JsonRpcProvider } from '@ethersproject/providers';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';

const providers = {};

export default function getProvider(network: string) {
  console.debug('Get provider', network);
  const url: string = networks[network].rpc[0];
  if (!providers[network]) providers[network] = new JsonRpcProvider(url);
  return providers[network];
}
