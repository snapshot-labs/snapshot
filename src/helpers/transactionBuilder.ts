import { pack } from '@ethersproject/solidity';
import {
  FunctionFragment,
  Interface,
  ParamType,
  Result
} from '@ethersproject/abi';
import { hexDataLength } from '@ethersproject/bytes';
import { BigNumber } from '@ethersproject/bignumber';
import { isArrayParameter } from './abi';
import ERC20_ABI from './abi/ERC20.json';
import ERC721_ABI from './abi/ERC721.json';

export const MULTI_SEND_ABI = [
  'function multiSend(bytes transactions) payable'
];

export enum MULTI_SEND_CONTRACT_ADDRESSES_V1_3_0 {
  CHAIN_1 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_3 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_4 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_10 = '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  CHAIN_28 = '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  CHAIN_42 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_5 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_56 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_69 = '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  CHAIN_100 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_122 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_123 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_137 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_246 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_288 = '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  CHAIN_588 = '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  CHAIN_1088 = '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  CHAIN_1285 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_1287 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_4002 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_42161 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_42220 = '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  CHAIN_43114 = '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  CHAIN_73799 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_80001 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_333999 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_1313161554 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_1313161555 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761'
}

export enum TransactionOperationType {
  CALL,
  DELEGATECALL
}

export enum TransactionForms {
  FUNDS = 'funds',
  NFT = 'nft',
  CONTRACT = 'contract'
  // UNISWAP = 'uniswap',
  // DEPLOY = 'deploy'
}

export type Transaction = {
  to: string;
  value: BigNumber;
  data: string;
  operation: TransactionOperationType;
  abi?: string;
};

export type ExecutableTransaction = Omit<Transaction, 'abi'>;

export type MultisendTransaction = ExecutableTransaction & {
  to: MULTI_SEND_CONTRACT_ADDRESSES_V1_3_0;
  operation: TransactionOperationType.DELEGATECALL;
};

export function convertToExecutableTransaction(
  transaction: Transaction
): ExecutableTransaction {
  const { to, value, data, operation } = transaction;

  return {
    to,
    value,
    data,
    operation
  };
}

export function encodeTransactionsForMultisend(transactions: Transaction[]) {
  const values = transactions.map(tx => [
    tx.operation,
    tx.to,
    tx.value,
    hexDataLength(tx.data || '0x'),
    tx.data || '0x'
  ]);

  const types = transactions.map(() => [
    'uint8',
    'address',
    'uint256',
    'uint256',
    'bytes'
  ]);

  return pack(types.flat(1), values.flat(1));
}

export function convertBatchToMultisendTransaction(
  batch: Transaction[],
  chainId: string
): MultisendTransaction {
  const multiSendContract = new Interface(MULTI_SEND_ABI);
  const transactionsEncoded = encodeTransactionsForMultisend(batch);
  const data = multiSendContract.encodeFunctionData('multiSend', [
    transactionsEncoded
  ]);
  return {
    to: MULTI_SEND_CONTRACT_ADDRESSES_V1_3_0[`CHAIN_${chainId}`],
    operation: TransactionOperationType.DELEGATECALL,
    value: BigNumber.from(0),
    data
  };
}

function extractMethodArgs(values: string[]) {
  return (param: ParamType, index) => {
    const value = values[index];
    if (isArrayParameter(param.baseType)) {
      return JSON.parse(value);
    }
    return value;
  };
}

export function encodeERC20TransferData(
  recipient: string,
  amount: BigNumber
): string {
  const contractInterface = new Interface(ERC20_ABI);
  return contractInterface.encodeFunctionData('transfer', [recipient, amount]);
}

export function decodeERC20TransferData(data: string): Result {
  const contractInterface = new Interface(ERC20_ABI);
  const method = contractInterface.getFunction('transfer');

  return contractInterface.decodeFunctionData(method, data);
}

export function encodeERC721TransferData(
  from: string,
  recipient: string,
  tokenId: BigNumber
): string {
  const contractInterface = new Interface(ERC721_ABI);
  return contractInterface.encodeFunctionData('safeTransferFrom', [
    from,
    recipient,
    tokenId
  ]);
}

export function decodeERC721TransferData(data: string): Result {
  const contractInterface = new Interface(ERC721_ABI);
  const method = contractInterface.getFunction('safeTransferFrom');

  return contractInterface.decodeFunctionData(method, data);
}

export function encodeContractData(
  abi: string,
  method: FunctionFragment,
  paramValues: any[]
) {
  const contractInterface = new Interface(abi);
  const parameterValues = method.inputs.map(extractMethodArgs(paramValues));
  return contractInterface.encodeFunctionData(method, parameterValues);
}

export function createEmptyTransaction(): Transaction {
  return {
    to: '',
    value: BigNumber.from(0),
    data: '0x',
    operation: TransactionOperationType.CALL
  };
}

enum FunctionSignatures {
  ERC20_TRANSFER = '0xa9059cbb',
  ERC721_SAFE_TRANSFER_FROM = '0x42842e0e',
  ERC721_SAFE_TRANSFER_FROM_TO_CONTRACT = '0xb88d4fde'
}

export function detectTransactionForm(
  transaction: Transaction
): TransactionForms {
  const functionSignature = transaction.data.slice(0, 10);

  if (
    functionSignature === FunctionSignatures.ERC721_SAFE_TRANSFER_FROM ||
    functionSignature ===
      FunctionSignatures.ERC721_SAFE_TRANSFER_FROM_TO_CONTRACT
  ) {
    return TransactionForms.NFT;
  }

  if (
    functionSignature === FunctionSignatures.ERC20_TRANSFER ||
    functionSignature === '0x'
  ) {
    return TransactionForms.FUNDS;
  }

  return TransactionForms.CONTRACT;
}
