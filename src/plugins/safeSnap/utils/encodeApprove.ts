import { Interface } from '@ethersproject/abi';
import { getParams } from './getParams';

export const APPROVE_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  }
];

export const encodeApprove = (params: string[]) => {
  const contract = new Interface(APPROVE_ABI);
  const method = Object.entries(contract.functions);
  let encodedData = '0x';

  try {
    encodedData = contract.encodeFunctionData('approve', params);
  } catch (error) {
    console.log('error', error);
    console.log('error encoding approve function');
  }

  return {
    encodedData,
    params: getParams(method[0][1], params),
    signature: method[0][0]
  };
};
