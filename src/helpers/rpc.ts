import { JsonRpcProvider } from '@ethersproject/providers';
import config from '@/helpers/config';

const chainId = process.env.VUE_APP_CHAIN_ID || '1';
const url: any = config.networks[chainId].rpcUrl;
const provider = new JsonRpcProvider(url);

export default provider;
