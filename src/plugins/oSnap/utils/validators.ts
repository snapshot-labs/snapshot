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
import {
  createContractInteractionTransaction,
  createTransferFundsTransaction,
  createTransferNftTransaction
} from './transactions';
import {
  getERC20TokenTransferTransactionData,
  getERC721TokenTransferTransactionData
} from './abi';
import { isNativeAsset } from './coins';
import { FunctionFragment } from '@ethersproject/abi';

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

export function processTransferFundsInput(params: {
  recipient: string;
  amount: string;
  token: Token;
}): TransferFundsTransaction {
  try {
    const { recipient, amount, token } = params;
    const data =
      token.address === 'main'
        ? '0x'
        : getERC20TokenTransferTransactionData(recipient, amount);
    const transaction = createTransferFundsTransaction({
      data,
      amount: amount,
      recipient: recipient,
      token: token
    });
    return transaction;
  } catch {
    // if processing throws, we can not keep possibly valid state upstream, we must reset to empty values, while retaining form state
    return {
      type: 'transferFunds',
      to: '',
      value: '0',
      data: '0x',
      formatted: ['', 0, '0', '0x'],
      isValid: false
    };
  }
}

export function processTransferNftInput(params: {
  safeAddress: string;
  recipient: string;
  collectible: NFT | undefined;
}): TransferNftTransaction {
  try {
    const { safeAddress, recipient, collectible } = params;
    if (!collectible) {
      throw new Error('no NFT selected');
    }
    const data = getERC721TokenTransferTransactionData(
      safeAddress,
      recipient,
      collectible.id
    );

    const transaction = createTransferNftTransaction({
      data,
      recipient: recipient,
      collectable: collectible
    });

    return transaction;
  } catch {
    // if processing throws, we can not keep possibly valid state upstream, we must reset to empty values, while retaining form state
    return createTransferNftTransaction({
      data: '',
      recipient: '',
      collectable: {
        name: '',
        address: '',
        id: ''
      }
    });
  }
}

export function processContractInteractionTransaction(params: {
  to: string;
  value: string;
  abi: string;
  method: FunctionFragment;
  parameters: string[];
}): ContractInteractionTransaction {
  try {
    const { to, value, abi, method, parameters } = params;
    const transaction = createContractInteractionTransaction({
      to,
      value,
      abi,
      method,
      parameters
    });
    return transaction;
  } catch {
    // if processing throws, we can not keep possibly valid state upstream, we must reset to empty values, while retaining form state
    return {
      type: 'contractInteraction',
      to: '',
      value: '0',
      data: '0x',
      formatted: ['', 0, '0', '0x'],
      isValid: false
    };
  }
}

function isContractInteractionValid(
  tx: ContractInteractionTransaction
): boolean {
  // TODO: validate
  return true;
}

function validateContractInteraction(
  tx: ContractInteractionTransaction
): ContractInteractionTransaction {
  return {
    ...tx,
    isValid: isContractInteractionValid(tx)
  };
}

function isTransferFundsValid(tx: TransferFundsTransaction): boolean {
  // validate base transaction
  if (!validateTransaction(tx)) {
    return false;
  }

  // check empty values
  if (!tx.recipient || !tx.amount) {
    return false;
  }

  if (!isNativeAsset(tx.token)) {
    // must have data for ERC20 transfers
    if (tx.data === '' || tx.data === '0x') {
      return false;
    }
  }

  if (!isAddress(tx.recipient) || !amountPositive(tx.amount)) {
    return false;
  }

  return true;
}

function validateTransferFunds(
  tx: TransferFundsTransaction
): TransferFundsTransaction {
  return {
    ...tx,
    isValid: isTransferFundsValid(tx)
  };
}

function isTransferNftValid(tx: TransferNftTransaction): boolean {
  // validate base transaction
  if (!validateTransaction(tx)) {
    return false;
  }

  // check empty values
  if (!tx.recipient || !tx.collectable) {
    return false;
  }

  // check NFT transfer variables are correct
  if (
    !isAddress(tx.recipient) ||
    !isAddress(tx.collectable.address) ||
    !tx.collectable.id
  ) {
    return false;
  }

  return true;
}

function validateTransferNft(
  tx: TransferNftTransaction
): TransferNftTransaction {
  return {
    ...tx,
    isValid: isTransferNftValid(tx)
  };
}

function amountPositive(amount: string) {
  return isBigNumberish(amount) && parseInt(amount) > 0;
}

export function validateOsnapTransaction(tx: Transaction) {
  //  handle validation for each type individually
  switch (tx.type) {
    case 'transferFunds':
      return validateTransferFunds(tx);
    case 'transferNFT':
      return validateTransferNft(tx);
    case 'contractInteraction':
      return validateContractInteraction(tx);
    default:
      return tx;
  }
}

export function allTransactionsValid(transactions: Transaction[]): boolean {
  return transactions.every(tx => tx.isValid === true);
}
