import { isAddress } from '@ethersproject/address';
import {
  JsonRpcProvider,
  StaticJsonRpcProvider
} from '@ethersproject/providers';
import memoize from 'lodash/memoize';
import { Contract } from '@ethersproject/contracts';
import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import { isHexString } from '@ethersproject/bytes';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { OPTIMISTIC_GOVERNOR_ABI } from '../constants';
import {
  BaseTransaction,
  ContractInteractionTransaction,
  NFT,
  Token,
  Transaction,
  TransferFundsTransaction,
  TransferNftTransaction
} from '../types';
import { extractMethodArgs, getABIWriteFunctions } from './abi';
import { isNativeAsset } from './coins';

/**
 * Validates that the given `address` is a valid Ethereum address
 */
export const mustBeEthereumAddress = memoize((address: string) => {
  const startsWith0x = address?.startsWith('0x');
  const isValidAddress = isAddress(address);
  return startsWith0x && isValidAddress;
});

/**
 * Validates that the given `address` is a valid Ethereum contract address
 */
export const mustBeEthereumContractAddress = memoize(
  async (network: string, address: string) => {
    const provider = getProvider(network) as JsonRpcProvider;
    const contractCode = await provider.getCode(address);

    return (
      contractCode && contractCode.replace(/^0x/, '').replace(/0/g, '') !== ''
    );
  },
  (url, contractAddress) => `${url}_${contractAddress}`
);

/**
 * Validates a transaction.
 */
export function validateTransaction(transaction: BaseTransaction) {
  const addressNotEmptyOrInvalid =
    transaction.to !== '' && isAddress(transaction.to);
  const valueIsPositive =
    isBigNumberish(transaction.value) && parseInt(transaction.value) > 0;
  return (
    valueIsPositive &&
    addressNotEmptyOrInvalid &&
    (!transaction.data || isHexString(transaction.data))
  );
}

/**
 * Validates a module address.
 */
export async function validateModuleAddress(
  network: string,
  moduleAddress: string
): Promise<boolean> {
  if (!isAddress(moduleAddress)) return false;
  const provider: StaticJsonRpcProvider = getProvider(network);
  const moduleContract = new Contract(
    moduleAddress,
    OPTIMISTIC_GOVERNOR_ABI,
    provider
  );

  return moduleContract
    .rules()
    .then(() => true)
    .catch(() => false);
}

export function isContractInteractionParamsValid(params: {
  value: string;
  selectedMethod: string;
  params: string[];
}): boolean {
  // TODO: validate function params

  return true;
}

export function isTransferFundsValid(params: {
  token: Token;
  recipient: string;
  amount: string;
}): boolean {
  if (!amountPositive(params.amount)) {
    return false;
  }
  if (!params.recipient || !isAddress(params.recipient)) {
    return false;
  }
  if (!(params.token.address === 'main') && !isAddress(params.token.address)) {
    return false;
  }

  return true;
}

export function isTransferNftValid(params: {
  collectable: NFT | undefined;
  recipient: string;
}): boolean {
  // check NFT transfer variables are correct
  if (!params.collectable) {
    return false;
  }
  if (
    !isAddress(params.recipient) ||
    !isAddress(params.collectable.address) ||
    !params.collectable.id
  ) {
    return false;
  }

  return true;
}

function amountPositive(amount: string) {
  return isBigNumberish(amount) && parseInt(amount) > 0;
}

export function allTransactionsValid(transactions: Transaction[]): boolean {
  return transactions.every(tx => tx.isValid === true);
}
