import { Web3Provider } from '@ethersproject/providers';
import { verifyTypedData } from '@ethersproject/wallet';
import { _TypedDataEncoder } from '@ethersproject/hash';
import { name, version } from '@/../package.json';

const domain = {
  name,
  version,
  chainId: 1
};

const types = {
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

  const signer = web3.getSigner();
  const sig = await signer._signTypedData(domain, types, message);
  console.log('Sig!', sig);

  const recover = verifyTypedData(domain, types, message, sig);
  console.log('Address', address);
  console.log('Recover', recover);
  console.log(recover === address ? 'Match!' : 'Not match!');

  const hash = _TypedDataEncoder.hash(domain, types, message);
  console.log('Hash', hash);

  // const recoverAddress = sigUtil.recoverTypedSignature_v4({ data, sig });
  // console.log('Recover address', recoverAddress);

  return {
    address,
    sig,
    data
  };
}
