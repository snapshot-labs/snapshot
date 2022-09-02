import { pack } from '@ethersproject/solidity';
import { FunctionFragment, Interface, ParamType } from '@ethersproject/abi';
import { hexDataLength } from '@ethersproject/bytes';
import { BigNumber } from '@ethersproject/bignumber';
import { ABI, ERC20_ABI, ERC721_ABI, isArrayParameter } from './abi';

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

export enum TransactionType {
  TOKEN = 'token',
  COLLECTABLE = 'collectable',
  CONTRACT = 'contract',
  RAW = 'raw'
}

export interface RawTransaction {
  to: string;
  value: BigNumber;
  data: string;
  operation: TransactionOperationType;
}

export interface TokenTransaction {
  amount: BigNumber;
  recipient: string;
  tokenAddress: string;
}

export interface CollectableTransaction {
  from: string;
  recipient: string;
  collectableAddress: string;
  collectableId: string;
}

export interface ContractTransaction {
  contractAddress: string;
  method: string;
  params: any[];
  abi: ABI;
}

export type Transaction =
  | RawTransaction
  | TokenTransaction
  | CollectableTransaction
  | ContractTransaction;

export interface MultisendTransaction extends RawTransaction {
  to: MULTI_SEND_CONTRACT_ADDRESSES_V1_3_0;
  operation: TransactionOperationType.DELEGATECALL;
}

export function isRawTransaction(
  transaction: any
): transaction is RawTransaction {
  return (
    'to' in transaction &&
    'value' in transaction &&
    'data' in transaction &&
    'operation' in transaction
  );
}

export function isTokenTransaction(
  transaction: any
): transaction is TokenTransaction {
  return (
    'amount' in transaction &&
    'recipient' in transaction &&
    'tokenAddress' in transaction
  );
}

export function isCollectableTransaction(
  transaction: any
): transaction is CollectableTransaction {
  return (
    'recipient' in transaction &&
    'collectableAddress' in transaction &&
    'collectableId' in transaction
  );
}

export function isContractTransaction(
  transaction: any
): transaction is ContractTransaction {
  return (
    'contractAddress' in transaction &&
    'method' in transaction &&
    'params' in transaction &&
    'abi' in transaction
  );
}

export function encodeTransactions(transactions: RawTransaction[]) {
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
  batch: RawTransaction[],
  chainId: string
): MultisendTransaction {
  const multiSendContract = new Interface(MULTI_SEND_ABI);
  const transactionsEncoded = encodeTransactions(batch);
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

export function getERC20TokenTransferTransactionData(
  transaction: TokenTransaction
): string {
  const contractInterface = new Interface(ERC20_ABI);
  return contractInterface.encodeFunctionData('transfer', [
    transaction.recipient,
    transaction.amount
  ]);
}

export function getERC721TokenTransferTransactionData(
  transaction: CollectableTransaction
): string {
  const contractInterface = new Interface(ERC721_ABI);
  return contractInterface.encodeFunctionData('safeTransferFrom', [
    transaction.from,
    transaction.recipient,
    transaction.collectableId
  ]);
}

export function getContractTransactionData(transaction: ContractTransaction) {
  const contractInterface = new Interface(transaction.abi);
  const parameterValues = FunctionFragment.from(transaction.method).inputs.map(
    extractMethodArgs(transaction.params)
  );
  return contractInterface.encodeFunctionData(
    transaction.method,
    parameterValues
  );
}

export function convertToRawTransaction(
  transaction: Transaction
): RawTransaction {
  if (isRawTransaction(transaction)) {
    return transaction;
  } else if (isTokenTransaction(transaction)) {
    return {
      to: transaction.tokenAddress,
      value: BigNumber.from(0),
      data: getERC20TokenTransferTransactionData(transaction),
      operation: TransactionOperationType.CALL
    };
  } else if (isCollectableTransaction(transaction)) {
    return {
      to: transaction.collectableAddress,
      value: BigNumber.from(0),
      data: getERC721TokenTransferTransactionData(transaction),
      operation: TransactionOperationType.CALL
    };
  } else if (isContractTransaction(transaction)) {
    return {
      to: transaction.contractAddress,
      value: BigNumber.from(0),
      data: getContractTransactionData(transaction),
      operation: TransactionOperationType.CALL
    };
  } else {
    throw new Error('Unkown transaction type');
  }
}

export function createEmptyTransaction(type: TransactionType): Transaction {
  switch (type) {
    case TransactionType.RAW:
      return {
        to: '',
        value: BigNumber.from(0),
        data: '',
        operation: TransactionOperationType.CALL
      };
    case TransactionType.TOKEN:
      return {
        amount: BigNumber.from(0),
        recipient: '',
        tokenAddress: ''
      };
    case TransactionType.COLLECTABLE:
      return {
        from: '',
        recipient: '',
        collectableAddress: '',
        collectableId: ''
      };
    case TransactionType.CONTRACT:
      return {
        contractAddress: '',
        method: '',
        params: [],
        abi: []
      };
    default:
      throw new Error(`Unknown transaction type: ${type}`);
  }
}
