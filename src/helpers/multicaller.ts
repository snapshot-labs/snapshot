import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { set } from 'lodash';
import { multicall } from '@/helpers/call';

export default class Multicaller {
  public network: string;
  public provider: StaticJsonRpcProvider;
  public abi: any[];
  public options: any = {};
  public calls: any[] = [];
  public paths: any[] = [];

  constructor(
    network: string,
    provider: StaticJsonRpcProvider,
    abi: any[],
    options?
  ) {
    this.network = network;
    this.provider = provider;
    this.abi = abi;
    this.options = options || {};
  }

  call(path, address, fn, params?): Multicaller {
    this.calls.push([address, fn, params]);
    this.paths.push(path);
    return this;
  }

  async execute(from?: any): Promise<any> {
    const obj = from || {};
    const result = await multicall(
      this.network,
      this.provider,
      this.abi,
      this.calls,
      this.options
    );
    result.forEach((r, i) => set(obj, this.paths[i], r.length > 1 ? r : r[0]));
    this.calls = [];
    this.paths = [];
    return obj;
  }
}
