import { isAddress } from '@ethersproject/address';
import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import { isHexString } from '@ethersproject/bytes';
import { Contract } from '@ethersproject/contracts';
import { _TypedDataEncoder } from '@ethersproject/hash';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { toUtf8Bytes } from '@ethersproject/strings';

import { SafeTransaction } from '@/helpers/interfaces';
import {
  sendTransaction
} from '@snapshot-labs/snapshot.js/src/utils';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import {
  EIP712_TYPES,
  ERC20_ABI,
  UMA_MODULE_ABI
} from './constants';
import { OptimisticGovernorTransaction, Transaction, Network } from './types';
import { getModuleDetailsFromChain, getModuleDetailsGql } from './utils/umaModule';

export * from './constants';

export * from './utils/abi';
export * from './utils/coins';
export * from './utils/decoder';
export * from './utils/index';
export * from './utils/multiSend';
export * from './utils/safe';
export * from './utils/transactions';

  export function calcTransactionHash(
    network: string,
    moduleAddress: string,
    transaction: SafeTransaction
  ) {
    const chainId = parseInt(network);
    const domain = {
      chainId,
      verifyingContract: moduleAddress
    };
    return _TypedDataEncoder.hash(domain, EIP712_TYPES, transaction);
  }

  export function calcTransactionHashes(
    chainId: number,
    moduleAddress: string,
    transactions: SafeTransaction[]
  ) {
    const domain = {
      chainId: chainId,
      verifyingContract: moduleAddress
    };
    return transactions.map(tx => {
      return _TypedDataEncoder.hash(domain, EIP712_TYPES, {
        ...tx,
        nonce: tx.nonce || '0',
        data: tx.data || '0x'
      });
    });
  }

  export async function validateModuleAddress(network: string, moduleAddress: string): Promise<boolean> {
    if (!isAddress(moduleAddress)) return false;
    const provider: StaticJsonRpcProvider = getProvider(network);
    const moduleContract = new Contract(moduleAddress, UMA_MODULE_ABI, provider);

    return moduleContract
      .rules()
      .then(() => true)
      .catch(() => false);
  }

  export async function getExecutionDetails(
    network: Network,
    moduleAddress: string,
    proposalId: string,
    explanation: string,
    transactions: OptimisticGovernorTransaction[]
  ) {
    const moduleDetails = await getModuleDetails(
      network,
      moduleAddress,
      explanation,
      transactions
    );

    return {
      ...moduleDetails,
      proposalId,
      explanation
    };
  }

  export async function *approveBond(
    network: Network,
    web3: any,
    moduleAddress: string,
    transactions?: OptimisticGovernorTransaction[]
  ) {
    const moduleDetails = await getModuleDetails(
      network,
      moduleAddress,
      '',
      transactions
    );

    const approveTx = await sendTransaction(
      web3,
      moduleDetails.collateral,
      ERC20_ABI as any,
      'approve',
      [moduleAddress, moduleDetails.minimumBond],
      {}
    );
    yield approveTx;
    const approvalReceipt = await approveTx.wait();
    console.log('[DAO module] token transfer approved:', approvalReceipt);
    yield;
  }

  export async function getModuleDetails(
    network: Network,
    moduleAddress: string,
    explanation = '',
    transactions?: OptimisticGovernorTransaction[]
  ) {
    const provider: StaticJsonRpcProvider = getProvider(network);
    try {
      // try optimized calls, which use the graph over web3 event queries
      return await getModuleDetailsGql(
        provider,
        network,
        moduleAddress,
        explanation,
        transactions
      );
    } catch (err) {
      console.warn('Error querying module details from the graph:', err);
      // fall back to web3 event queries.
      return getModuleDetailsFromChain(
        provider,
        network,
        moduleAddress,
        explanation,
        transactions
      );
    }
  }

  export async function *submitProposal(
    web3: any,
    moduleAddress: string,
    explanation: string,
    transactions: OptimisticGovernorTransaction[]
  ) {
    const explanationBytes = toUtf8Bytes(explanation);
    const tx = await sendTransaction(
      web3,
      moduleAddress,
      UMA_MODULE_ABI as any,
      'proposeTransactions',
      [transactions, explanationBytes]
      // [[["0xB8034521BB1a343D556e5005680B3F17FFc74BeD", 0, "0", "0x"]], '0x']
    );
    yield tx;
    const receipt = await tx.wait();
    console.log('[DAO module] submitted proposal:', receipt);
  }

  export async function *executeProposal(
    web3: any,
    moduleAddress: string,
    transactions: OptimisticGovernorTransaction[]
  ) {
    const tx = await sendTransaction(
      web3,
      moduleAddress,
      UMA_MODULE_ABI as any,
      'executeProposal',
      [transactions]
    );
    yield tx;
    const receipt = await tx.wait();
    console.log('[DAO module] executed proposal:', receipt);
  }

export function validateTransaction(transaction: Transaction) {
  const addressEmptyOrValidate =
    transaction.to === '' || isAddress(transaction.to);
  return (
    isBigNumberish(transaction.value) &&
    addressEmptyOrValidate &&
    (!transaction.data || isHexString(transaction.data)) &&
    isBigNumberish(transaction.nonce)
  );
}