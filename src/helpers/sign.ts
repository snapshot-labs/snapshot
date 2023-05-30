import { getAddress } from '@ethersproject/address';
import type { Web3Provider } from '@ethersproject/providers';
import type { Wallet } from '@ethersproject/wallet';

const domain = {
  name: 'snapshot',
  version: '0.1.4'
};

export type DataType = Record<string, { name: string; type: string }[]>;

export type ISubscribe = {
  address: string;
} & Record<string, any>;

export default async function sign(
  web3: Web3Provider | Wallet,
  address: string,
  message: ISubscribe,
  types: DataType
) {
  const signer = 'getSigner' in web3 ? web3.getSigner() : web3;
  message.address = getAddress(address);
  return await signer._signTypedData(domain, types, message);
}
