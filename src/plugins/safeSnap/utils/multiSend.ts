import { pack } from '@ethersproject/solidity';
import { Interface } from '@ethersproject/abi';
import { hexDataLength } from '@ethersproject/bytes';

import { SafeTransaction } from '../models';
import { MULTI_SEND_ABI, MULTI_SEND_VERSIONS } from '../constants';

export enum MULTI_SEND_VERSION {
  V1_3_0 = '1.3.0',
  V1_2_0 = '1.2.0',
  V1_1_1 = '1.1.1'
}

export function getMultiSend(
  network: number | string,
  version: MULTI_SEND_VERSION = MULTI_SEND_VERSION.V1_3_0
) {
  return MULTI_SEND_VERSIONS[version][network.toString()];
}

export function encodeTransactions(transactions: SafeTransaction[]) {
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
  txs: SafeTransaction[],
  nonce: number,
  multiSendAddress: string
) {
  const multiSendContract = new Interface(MULTI_SEND_ABI);
  const transactionsEncoded = encodeTransactions(txs);
  const data = multiSendContract.encodeFunctionData('multiSend', [
    transactionsEncoded
  ]);
  return {
    to: multiSendAddress,
    operation: '1',
    value: '0',
    nonce: nonce.toString(),
    data
  };
}
