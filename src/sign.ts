import { Web3Provider } from '@ethersproject/providers';
import { verifyTypedData } from '@ethersproject/wallet';
import { _TypedDataEncoder } from '@ethersproject/hash';
import { name, version } from '@/../package.json';

const domain = {
  name,
  version
  // chainId: 1
};

const types = {
  Vote: [
    { name: 'space', type: 'string' },
    { name: 'timestamp', type: 'uint64' },
    { name: 'proposal', type: 'bytes32' },
    { name: 'choice', type: 'uint32' },
    { name: 'metadata', type: 'string' }
  ],
  Proposal: [
    { name: 'space', type: 'string' },
    { name: 'timestamp', type: 'uint64' },
    { name: 'type', type: 'string' },
    { name: 'title', type: 'string' },
    { name: 'body', type: 'string' },
    { name: 'choices', type: 'string[]' },
    { name: 'start', type: 'uint64' },
    { name: 'end', type: 'uint64' },
    { name: 'snapshot', type: 'uint64' },
    { name: 'metadata', type: 'string' }
  ]
};

interface Vote {
  space: string;
  timestamp: number;
  proposal: string;
  choice: number;
  metadata: string;
}

export async function vote(web3: Web3Provider, address: string, message: Vote) {
  const data: any = { domain, types: { Vote: types.Vote }, message };

  console.log(JSON.stringify(data));

  const signer = web3.getSigner();
  const sig = await signer._signTypedData(domain, data.types, message);
  console.log('Sig!', sig);

  const recover = verifyTypedData(domain, data.types, message, sig);
  console.log('Address', address);
  console.log('Recover', recover);
  console.log(recover === address ? 'Match!' : 'Not match!');

  const hash = _TypedDataEncoder.hash(domain, data.types, message);
  console.log('Hash', hash);

  // const recoverAddress = sigUtil.recoverTypedSignature_v4({ data, sig });
  // console.log('Recover address', recoverAddress);

  return {
    address,
    sig,
    data
  };
}

export async function send(body) {
  const url = `${process.env.VUE_APP_HIGHLIGHT_URL}/api/message`;
  const init = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };
  return new Promise((resolve, reject) => {
    fetch(url, init)
      .then(res => {
        if (res.ok) return resolve(res.json());
        throw res;
      })
      .catch(e => e.json().then(json => reject(json)));
  });
}
