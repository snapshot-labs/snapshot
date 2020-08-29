import { WebSocketProvider } from '@ethersproject/providers';

const url: any = process.env.VUE_APP_WS_URL;
const provider = new WebSocketProvider(url);

export default provider;
