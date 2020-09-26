import { JsonRpcProvider, WebSocketProvider } from '@ethersproject/providers';
import networks from '@/helpers/networks.json';

export class Providers {
  public rpc?: JsonRpcProvider;
  public ws?: WebSocketProvider;

  async setNetwork(chainId) {
    const rpcUrl: any = networks[chainId].rpcUrl;
    this.rpc = new JsonRpcProvider(rpcUrl);
    // const wsUrl: any = networks[chainId].wsUrl;
    // this.ws = wsUrl ? new WebSocketProvider(wsUrl) : undefined;
  }
}

export default new Providers();
