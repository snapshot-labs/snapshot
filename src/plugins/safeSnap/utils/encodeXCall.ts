import { Interface } from '@ethersproject/abi';
import { getParams } from './getParams';

export const XCALL_ABI = [
  {
    inputs: [
      { internalType: 'uint32', name: '_destination', type: 'uint32' },
      { internalType: 'address', name: '_to', type: 'address' },
      { internalType: 'address', name: '_asset', type: 'address' },
      { internalType: 'address', name: '_delegate', type: 'address' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
      { internalType: 'uint256', name: '_slippage', type: 'uint256' },
      { internalType: 'bytes', name: '_callData', type: 'bytes' }
    ],
    name: 'xcall',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'payable',
    type: 'function'
  }
];

export const encodeXCall = (params: string[]) => {
  const contract = new Interface(XCALL_ABI);
  const method = Object.entries(contract.functions);
  let encodedData = '0x';

  try {
    encodedData = contract.encodeFunctionData('xcall', params);
  } catch (error) {
    console.log('error', error);
    console.log('error encoding xcall function');
  }

  return {
    encodedData,
    params: getParams(method[0][1], params),
    signature: method[0][0]
  };
};

/**
 * Decode xcall transaction.
 * @param {string} data
 * @return {object}
 */
export const decodeXCall = (data: string) => {
  const contractInterface = new Interface(XCALL_ABI);
  try {
    const decodedData = contractInterface.decodeFunctionData('xcall', data);
    return {
      destination: decodedData._destination,
      to: decodedData._to,
      asset: decodedData._asset,
      delegate: decodedData._delegate,
      amount: decodedData._amount,
      slippage: decodedData._slippage,
      callData: decodedData._callData
    };
  } catch (error) {
    console.error('Error decoding xcall data:', error);
    return null;
  }
};
