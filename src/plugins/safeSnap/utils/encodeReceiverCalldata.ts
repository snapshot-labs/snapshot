import { defaultAbiCoder } from '@ethersproject/abi';

// Enum Operation: https://github.com/safe-global/safe-contracts/blob/main/contracts/common/Enum.sol
// 0 = Call
// 1 = DelegateCall
type Operation = 0 | 1;

export const encodeReceiverCallData = (
  to: string,
  value: string,
  data: string,
  // Temporary: We are hardcoding the operation to 0 (Call) for now
  // because connext don't support multicall yet
  operation: Operation = 0
) => {
  const encodedParams = defaultAbiCoder.encode(
    ['address', 'uint256', 'bytes', 'uint8'],
    [to, value, data, operation]
  );

  return encodedParams;
};

export const encodeRecipientCallData = (recipient: string) => {
  const encodedParams = defaultAbiCoder.encode(['address'], [recipient]);

  return encodedParams;
};
