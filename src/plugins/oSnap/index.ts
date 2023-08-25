import { isAddress } from '@ethersproject/address';
import { isHexString } from '@ethersproject/bytes';
import { toUtf8Bytes } from '@ethersproject/strings';
import { Contract } from '@ethersproject/contracts';
import { _TypedDataEncoder } from '@ethersproject/hash';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { keccak256 as solidityKeccak256 } from '@ethersproject/solidity';
import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';

import {
  sendTransaction
} from '@snapshot-labs/snapshot.js/src/utils';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import {
  SafeTransaction,
} from '@/helpers/interfaces';
import {
  EIP712_TYPES,
  UMA_MODULE_ABI,
  ERC20_ABI
} from './constants';
import { getModuleDetailsUma, getModuleDetailsUmaGql } from './utils/umaModule';
import { Network } from './types';

export * from './constants';

export * from './utils/abi';
export * from './utils/safe';
export * from './utils/coins';
export * from './utils/index';
export * from './utils/decoder';
export * from './utils/multiSend';
export * from './utils/transactions';

export default class Plugin {
  validateTransaction(transaction: SafeTransaction) {
    const addressEmptyOrValidate =
      transaction.to === '' || isAddress(transaction.to);
    return (
      isBigNumberish(transaction.value) &&
      addressEmptyOrValidate &&
      (!transaction.data || isHexString(transaction.data)) &&
      ['0', '1'].includes(transaction.operation) &&
      isBigNumberish(transaction.nonce)
    );
  }

  calcTransactionHash(
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

  calcTransactionHashes(
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

  async validateUmaModule(network: string, umaAddress: string) {
    if (!isAddress(umaAddress)) return 'reality';

    const provider: StaticJsonRpcProvider = getProvider(network);
    const moduleContract = new Contract(umaAddress, UMA_MODULE_ABI, provider);

    return moduleContract
      .rules()
      .then(() => 'uma')
      .catch(() => 'reality');
  }

  async getExecutionDetailsUma(
    network: Network,
    moduleAddress: string,
    proposalId: string,
    explanation: string,
    transactions: any
  ) {
    const moduleDetails = await this.getModuleDetailsUma(
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

  async *approveBondUma(
    network: Network,
    web3: any,
    moduleAddress: string,
    transactions?: any
  ) {
    const moduleDetails = await this.getModuleDetailsUma(
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

  async getModuleDetailsUma(
    network: Network,
    moduleAddress: string,
    explanation?: string,
    transactions?: any
  ) {
    const provider: StaticJsonRpcProvider = getProvider(network);
    try {
      // try optimized calls, which use the graph over web3 event queries
      return await getModuleDetailsUmaGql(
        provider,
        network,
        moduleAddress,
        explanation,
        transactions
      );
    } catch (err) {
      console.warn('Error querying module details from the graph:', err);
      // fall back to web3 event queries.
      return getModuleDetailsUma(
        provider,
        network,
        moduleAddress,
        explanation,
        transactions
      );
    }
  }

  async *submitProposalUma(
    web3: any,
    moduleAddress: string,
    explanation: string,
    transactions: any
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

  async *executeProposalUma(
    web3: any,
    moduleAddress: string,
    transactions: any
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
}
