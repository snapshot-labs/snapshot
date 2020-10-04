import { JsonRpcProvider } from '@ethersproject/providers';
import networks from '@/helpers/networks.json';

export default function getProvider(chainId: number) {
  const rpcUrl: string = networks[chainId].rpcUrl;
  return new JsonRpcProvider(rpcUrl);
}
