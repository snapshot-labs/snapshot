import { FunctionFragment } from '@ethersproject/abi';
import { BigNumber } from '@ethersproject/bignumber';
import {
  ContractInteractionTransaction,
  NFT,
  OptimisticGovernorTransaction,
  RawTransaction,
  Token,
  TransferFundsTransaction,
  TransferNftTransaction
} from '../types';
import { encodeMethodAndParams } from './abi';

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
}

export function parseAmount(input: string) {
  return BigNumber.from(input).toString();
}

export function parseValueInput(input: string) {
  try {
    return parseAmount(input);
  } catch (e) {
    return input;
  }
}
