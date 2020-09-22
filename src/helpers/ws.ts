import { WebSocketProvider } from '@ethersproject/providers';
import config from '@/helpers/config';

let provider;
const chainId = process.env.VUE_APP_CHAIN_ID || '1';
const url: any = config.networks[chainId].ws_url;
if (url) provider = new WebSocketProvider(url);

export default provider;
