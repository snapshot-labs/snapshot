import { FunctionFragment } from '@ethersproject/abi';
import { BigNumber } from '@ethersproject/bignumber';
import { ContractInteractionTransaction, NFT, RawTransaction, Token, TransferFundsTransaction, TransferNftTransaction } from '../types';
import { encodeMethodAndParams } from './abi';
import { createFormattedOptimisticGovernorTransaction } from './umaModule';

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
  }
}

export function createTransferNftTransaction(params: {
  recipient: string,
  collectable: NFT,
  data: string,
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
  }
}

export function createTransferFundsTransaction(params: {
  recipient: string;
  amount: string;
  token: Token;
  data: string;
}): TransferFundsTransaction {
  const type = 'transferFunds';
  const isNativeToken = params.token.address === 'main';
  const data = isNativeToken ? '0x' : params.data;
  const to = isNativeToken ? params.recipient : params.token.address;
  const amount = parseAmount(params.amount);
  const value = isNativeToken ? amount : '0';
  const formatted = createFormattedOptimisticGovernorTransaction({
    to,
    value,
    data,
  })
  return {
    ...params,
    type,
    data,
    to,
    value,
    amount,
    formatted,
  }
}

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
  const formatted = createFormattedOptimisticGovernorTransaction({...params, data });
  return {
    ...params,
    data,
    type,
    formatted,
  }
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
