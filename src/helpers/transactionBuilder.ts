import { pack } from '@ethersproject/solidity';
import { Interface } from '@ethersproject/abi';
import { hexDataLength } from '@ethersproject/bytes';
import { BigNumber } from '@ethersproject/bignumber';
import { CollectableAsset, TokenAsset } from './safe';
import { ComputedRef } from 'vue';

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

export const MULTI_SEND_CONTRACT_ADDRESSES_V1_2_0 = {
  '1': '0x6851D6fDFAfD08c0295C392436245E5bc78B0185',
  '4': '0x6851D6fDFAfD08c0295C392436245E5bc78B0185',
  '42': '0x6851D6fDFAfD08c0295C392436245E5bc78B0185',
  '5': '0x6851D6fDFAfD08c0295C392436245E5bc78B0185',
  '88': '0x6851D6fDFAfD08c0295C392436245E5bc78B0185',
  '100': '0x6851D6fDFAfD08c0295C392436245E5bc78B0185',
  '246': '0x6851D6fDFAfD08c0295C392436245E5bc78B0185',
  '73799': '0x6851D6fDFAfD08c0295C392436245E5bc78B0185'
};

export const MULTI_SEND_CONTRACT_ADDRESSES_V1_1_1 = {
  '1': '0x8D29bE29923b68abfDD21e541b9374737B49cdAD',
  '4': '0x8D29bE29923b68abfDD21e541b9374737B49cdAD',
  '5': '0x8D29bE29923b68abfDD21e541b9374737B49cdAD',
  '42': '0x8D29bE29923b68abfDD21e541b9374737B49cdAD',
  '88': '0x8D29bE29923b68abfDD21e541b9374737B49cdAD',
  '100': '0x8D29bE29923b68abfDD21e541b9374737B49cdAD',
  '246': '0x8D29bE29923b68abfDD21e541b9374737B49cdAD',
  '73799': '0x8D29bE29923b68abfDD21e541b9374737B49cdAD'
};

export enum MultiSendVersion {
  V1_3_0 = '1.3.0',
  V1_2_0 = '1.2.0',
  V1_1_1 = '1.1.1'
}

export enum TransactionOperationType {
  CALL,
  DELEGATECALL
}

export enum TransactionType {
  TRANSFER_FUNDS = 'transferFunds',
  TRANSFER_NFT = 'transferNft',
  CONTRACT = 'contractInteraction',
  RAW = 'raw'
}

export interface Transaction {
  type: TransactionType;
  to: string;
  value: BigNumber;
  data: string;
  operation: TransactionOperationType;
  [x: string]: any;
}

export interface TokenAssetTransaction extends Transaction {
  type: TransactionType.TRANSFER_FUNDS;
  amount: BigNumber;
  recipient: string;
  token?: TokenAsset;
}

export interface CollectableAssetTransaction extends Transaction {
  type: TransactionType.TRANSFER_NFT;
  recipient: string;
  collectable?: CollectableAsset;
}

export interface ContractTransaction extends Transaction {
  type: TransactionType.CONTRACT;
  abi: string[];
}

export interface RawTransaction extends Transaction {
  type: TransactionType.RAW;
}

const MULTI_SEND_VERSIONS: Record<MultiSendVersion, Record<string, string>> = {
  [MultiSendVersion.V1_1_1]: MULTI_SEND_CONTRACT_ADDRESSES_V1_1_1,
  [MultiSendVersion.V1_2_0]: MULTI_SEND_CONTRACT_ADDRESSES_V1_2_0,
  [MultiSendVersion.V1_3_0]: MULTI_SEND_CONTRACT_ADDRESSES_V1_3_0
};

export function getMultiSend(
  network: number | string,
  version: MultiSendVersion = MultiSendVersion.V1_3_0
) {
  return MULTI_SEND_VERSIONS[version][network.toString()];
}

export function encodeTransactions(transactions: Transaction[]) {
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
  batch: Transaction[],
  nonce: number,
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
    value: '0',
    nonce: nonce.toString(),
    data
  };
}

export function createEmptyTransaction(type: TransactionType): Transaction {
  const transaction = {
    type,
    to: '',
    value: BigNumber.from(0),
    data: '',
    operation: TransactionOperationType.CALL
  };

  if (type === TransactionType.TRANSFER_FUNDS) {
    return {
      ...transaction,
      recipient: '',
      amount: BigNumber.from(0),
      token: undefined
    };
  }

  if (type === TransactionType.TRANSFER_NFT) {
    return {
      ...transaction,
      recipient: '',
      collectable: undefined
    };
  }

  if (type === TransactionType.CONTRACT) {
    return {
      ...transaction,
      abi: []
    };
  }

  return transaction;
}
