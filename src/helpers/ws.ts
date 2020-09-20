import { WebSocketProvider } from '@ethersproject/providers';

let provider;
const url: any = process.env.VUE_APP_WS_URL;
if (url) provider = new WebSocketProvider(url);

export default provider;
