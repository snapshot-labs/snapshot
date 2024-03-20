import { FunctionFragment } from '@ethersproject/abi';
import { BigNumber } from '@ethersproject/bignumber';
import {
  ContractInteractionTransaction,
  NFT,
  OptimisticGovernorTransaction,
  RawTransaction,
  Token,
  TransferFundsTransaction,
  TransferNftTransaction,
  SafeImportTransaction,
  GnosisSafe
} from '../types';
import { encodeMethodAndParams, encodeSafeMethodAndParams } from './abi';

/**
 * Creates a formatted transaction for the Optimistic Governor to execute
 *
 * note: the value for `operation` is always zero because we do not support delegatecall.
 *
 * @see OptimisticGovernorTransaction
 */
export function createFormattedOptimisticGovernorTransaction({
  to,
  value,
  data
}: {
  to: string;
  value: string;
  data: string;
}): OptimisticGovernorTransaction {
  return [to, 0, value, data];
}

/**
 * Creates a raw transaction for the Optimistic Governor to execute
 *
 * @see RawTransaction
 */
export function createRawTransaction(params: {
  to: string;
  value: string;
  data: string;
}): RawTransaction {
  const type = 'raw';
  const formatted = createFormattedOptimisticGovernorTransaction(params);
  return {
    ...params,
    type,
    formatted,
    isValid: true
  };
}

/**
 * Creates a transaction to transfer an NFT
 *
 * @see TransferNftTransaction
 */
export function createTransferNftTransaction(params: {
  recipient: string;
  collectable: NFT;
  data: string;
}): TransferNftTransaction {
  const type = 'transferNFT';
  const to = params.collectable.address;
  const value = '0';
  const data = params.data;
  const formatted = createFormattedOptimisticGovernorTransaction({
    to,
    value,
    data
  });

  return {
    ...params,
    type,
    to,
    value,
    data,
    formatted,
    isValid: true
  };
}

/**
 * Creates a transaction to transfer funds
 *
 * @see TransferFundsTransaction
 */
export function createTransferFundsTransaction(params: {
  recipient: string;
  amount: string;
  token: Token;
  data: string;
}): TransferFundsTransaction {
  if (!(parseFloat(params.amount) > 0)) {
    throw new Error('Amount invalid');
  }
  const type = 'transferFunds';
  const isNativeToken = params.token.address === 'main';
  const data = isNativeToken ? '0x' : params.data;
  const to = isNativeToken ? params.recipient : params.token.address;
  const amount = parseAmount(params.amount);
  const value = isNativeToken ? amount : '0';
  const formatted = createFormattedOptimisticGovernorTransaction({
    to,
    value,
    data
  });
  return {
    ...params,
    type,
    data,
    to,
    value,
    amount,
    formatted,
    isValid: true
  };
}

/**
 * Creates a transaction to interact with a contract.
 *
 * the `method` is executed with the given `parameters`.
 *
 * @see ContractInteractionTransaction
 */
export function createContractInteractionTransaction(params: {
  to: string;
  value: string;
  abi: string;
  method: FunctionFragment;
  parameters: string[];
}): ContractInteractionTransaction {
  try {
    const type = 'contractInteraction';
    const data = encodeMethodAndParams(
      params.abi,
      params.method,
      params.parameters
    );
    const formatted = createFormattedOptimisticGovernorTransaction({
      ...params,
      data
    });
    return {
      ...params,
      data,
      type,
      formatted,
      isValid: true
    };
  } catch (error) {
    console.error(error);
    throw new Error('Invalid function parameters');
  }
}

export function parseAmount(input: string) {
  return BigNumber.from(input).toString();
}

export function parseValueInput(input: string) {
  if (input === '') {
    return parseAmount('0');
  }
  return parseAmount(input);
}

export type CreateSafeTransactionParams = {
  to: string;
  value: string;
  data: string | null;
  functionFragment?: FunctionFragment;
  parameters?: { [key: string]: string };
};

export function createSafeImportTransaction(
  params: CreateSafeTransactionParams
): SafeImportTransaction {
  const abi = JSON.stringify(Array(params.functionFragment));
  const methodName = params.functionFragment?.name;
  const parameters = params.parameters;
  // is native transfer funds
  if (!params.functionFragment) {
    const data = '0x';
    const formatted = createFormattedOptimisticGovernorTransaction({
      to: params.to,
      value: params.value,
      data
    });
    return {
      type: 'safeImport',
      isValid: true,
      abi,
      formatted,
      to: params.to,
      value: params.value,
      data,
      methodName,
      parameters
    };
  }
  // is contract interaction with NO args
  if (!params.parameters) {
    const data = params?.data || '0x';
    const formatted = createFormattedOptimisticGovernorTransaction({
      to: params.to,
      value: params.value,
      data
    });
    return {
      type: 'safeImport',
      isValid: true,
      abi,
      formatted,
      to: params.to,
      value: params.value,
      data,
      methodName,
      parameters
    };
  }

  // is contract interaction WITH args
  const encodedData =
    params?.data ||
    encodeSafeMethodAndParams(params.functionFragment, params.parameters) ||
    '0x';

  const formatted = createFormattedOptimisticGovernorTransaction({
    to: params.to,
    value: params.value,
    data: encodedData
  });

  return {
    type: 'safeImport',
    isValid: true,
    abi,
    formatted,
    to: params.to,
    value: params.value,
    data: encodedData,
    methodName,
    parameters
  };
}

// export function createSafeImportTransaction(
//   params: GnosisSafe.BatchTransaction
// ): SafeImportTransaction {
//   const abi = JSON.stringify([params.contractMethod]);
//   const subtype = params.contractMethod
//     ? 'contractInteraction'
//     : 'nativeTransfer';
//   const methodName = params.contractMethod?.name;
//   const parameters = params.contractInputsValues;
//   // is native transfer funds
//   if (!params.contractMethod) {
//     const data = '0x';
//     const formatted = createFormattedOptimisticGovernorTransaction({
//       to: params.to,
//       value: params.value,
//       data
//     });
//     return {
//       type: 'safeImport',
//       isValid: true,
//       abi,
//       formatted,
//       to: params.to,
//       value: params.value,
//       data,
//       subtype,
//       methodName,
//       parameters
//     };
//   }
//   // is contract interaction with NO args
//   if (!params.contractInputsValues) {
//     const data = params?.data || '0x';
//     const formatted = createFormattedOptimisticGovernorTransaction({
//       to: params.to,
//       value: params.value,
//       data
//     });
//     return {
//       type: 'safeImport',
//       isValid: true,
//       abi,
//       formatted,
//       to: params.to,
//       value: params.value,
//       data,
//       subtype,
//       methodName,
//       parameters
//     };
//   }

//   // is contract interaction WITH args
//   const encodedData =
//     params?.data ||
//     encodeSafeMethodAndParams(
//       params.contractMethod,
//       params.contractInputsValues
//     ) ||
//     '0x';

//   const formatted = createFormattedOptimisticGovernorTransaction({
//     to: params.to,
//     value: params.value,
//     data: encodedData
//   });

//   return {
//     type: 'safeImport',
//     isValid: true,
//     abi,
//     formatted,
//     to: params.to,
//     value: params.value,
//     data: encodedData,
//     subtype,
//     methodName,
//     parameters
//   };
// }
