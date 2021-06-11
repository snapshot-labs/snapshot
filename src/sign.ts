import * as sigUtil from 'eth-sig-util';
import { Web3Provider } from '@ethersproject/providers';
import { name, version } from '@/../package.json';

const domain = {
  name,
  version
};

const types = {
  EIP712Domain: [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' }
  ],
  Vote: [
    { name: 'space', type: 'string' },
    { name: 'type', type: 'string' },
    // { name: 'timestamp', type: 'uint64' },
    { name: 'payload', type: 'string' }
  ]
};

const primaryType = 'Vote';

interface Unit {
  space: string;
  type: string;
  // timestamp?: number;
  payload: string;
}

export async function signMessage(
  web3: Web3Provider,
  address: string,
  message: Unit
) {
  const data: any = {
    types,
    domain,
    primaryType,
    message
  };

  console.log(JSON.stringify(data));

  if (!web3.provider.request)
    throw new Error('Web3Provider missing request method');

  const sig = await web3.provider.request({
    method: 'eth_signTypedData_v4',
    params: [address, JSON.stringify(data)]
  });
  console.log('Sig', sig);

  const hash = '0x' + sigUtil.TypedDataUtils.sign(data).toString('hex');
  console.log('Hash', hash);

  const recoverAddress = sigUtil.recoverTypedSignature_v4({ data, sig });
  console.log('Address', address);
  console.log('Recover address', recoverAddress);

  return {
    address,
    sig,
    data
  };
}
