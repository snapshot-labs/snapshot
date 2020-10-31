import { JsonRpcProvider } from '@ethersproject/providers';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';

const providers = {};

export default function getProvider(network: string) {
  // console.log('Get provider', network);
  const rpcUrl: string = networks[network].rpcUrl;
  if (!providers[network]) providers[network] = new JsonRpcProvider(rpcUrl);
  return providers[network];
}
