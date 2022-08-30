import { pack } from '@ethersproject/solidity';
import { FunctionFragment, Interface } from '@ethersproject/abi';
import { hexDataLength } from '@ethersproject/bytes';
import { BigNumber } from '@ethersproject/bignumber';
import {
  ABI,
  getContractTransactionData,
  getERC20TokenTransferTransactionData,
  getERC721TokenTransferTransactionData
} from './abi';

export const MULTI_SEND_ABI = [
  'function multiSend(bytes transactions) payable'
];

export const MULTI_SEND_CONTRACT_ADDRESSES_V1_3_0 = {
  '1': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '3': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '4': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '10': '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  '28': '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  '42': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '5': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '56': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '69': '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  '100': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '122': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '123': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '137': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '246': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '288': '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  '588': '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  '1088': '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  '1285': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '1287': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '4002': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '42161': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '42220': '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  '43114': '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  '73799': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '80001': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '333999': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '1313161554': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '1313161555': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761'
};

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

export function getMultiSendAddress(network: number | string) {
  return MULTI_SEND_CONTRACT_ADDRESSES_V1_3_0[network.toString()];
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

export function createMultiSendTx(
  batch: RawTransaction[],
  nonce: string,
  multiSendAddress: string
) {
  const multiSendContract = new Interface(MULTI_SEND_ABI);
  const transactionsEncoded = encodeTransactions(batch);
  const data = multiSendContract.encodeFunctionData('multiSend', [
    transactionsEncoded
  ]);
  return {
    to: multiSendAddress,
    operation: TransactionOperationType.DELEGATECALL,
    value: BigNumber.from(0),
    nonce,
    data
  };
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
      data: getERC20TokenTransferTransactionData(
        transaction.recipient,
        transaction.amount
      ),
      operation: TransactionOperationType.CALL
    };
  } else if (isCollectableTransaction(transaction)) {
    return {
      to: transaction.collectableAddress,
      value: BigNumber.from(0),
      data: getERC721TokenTransferTransactionData(
        transaction.from,
        transaction.recipient,
        transaction.collectableId
      ),
      operation: TransactionOperationType.CALL
    };
  } else if (isContractTransaction(transaction)) {
    return {
      to: transaction.contractAddress,
      value: BigNumber.from(0),
      data: getContractTransactionData(
        transaction.abi,
        FunctionFragment.from(transaction.method),
        transaction.params
      ),
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
        data: '0x',
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
