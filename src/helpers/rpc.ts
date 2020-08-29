import { JsonRpcProvider } from '@ethersproject/providers';

const url: any = process.env.VUE_APP_RPC_URL;
const provider = new JsonRpcProvider(url);

export default provider;
