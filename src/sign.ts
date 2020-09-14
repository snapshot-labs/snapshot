import config from '@/helpers/config';
import type { Web3Provider } from '@ethersproject/providers';

// eip712 domain for snapshot
const domain = {
  name: 'Snapshot',
  version: '1',
  chainId: config.chainId,
  verifyingContract: config.verifyingContract
};

const types = {
  EIP712Domain: [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' }
  ],
  Action: [
    { name: 'token', type: 'address' }, // the token the action is concerning
    { name: 'type', type: 'string' }, // action type, e.g. "vote"
    { name: 'payload', type: 'string' }, // the JSON-encoded action data
    { name: 'timestamp', type: 'uint64' } // date in seconds since epoch
  ]
};

const primaryType = 'Message'

interface Message {
  token: string;
  type: string;
  payload: any;
  timestamp?: number;
}

export async function signMessage(
  provider: Web3Provider,
  address: string,
  message: Message
) {
  let { timestamp, payload } = message;
  // assign timestamp to current time if omitted
  if (typeof timestamp !== 'number') {
    timestamp = Math.floor(Date.now() / 1e3);
  }
  // stringify json payload if needed
  if (typeof payload !== 'string') {
    payload = JSON.stringify(payload);
  }

  const data = {
    types,
    domain,
    primaryType,
    message: {
      ...message,
      payload,
      timestamp
    }
  };

  if (!provider.provider.request) {
    throw new Error('Web3Providier missing request method');
  }

  const result = await provider.provider.request({
    method: 'eth_signTypedData_v4',
    params: [address, data],
  });

  return result
}