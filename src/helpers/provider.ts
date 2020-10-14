import { JsonRpcProvider } from '@ethersproject/providers';
import networks from '@/helpers/networks.json';

const providers = {};

export default function getProvider(chainId: number) {
  const rpcUrl: string = networks[chainId].rpcUrl;
  if (!providers[chainId]) providers[chainId] = new JsonRpcProvider(rpcUrl);
  return providers[chainId];
}
