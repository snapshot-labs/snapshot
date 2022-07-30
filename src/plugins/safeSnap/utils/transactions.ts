import { FunctionFragment } from '@ethersproject/abi';
import { isHexString } from '@ethersproject/bytes';
import { BigNumber } from '@ethersproject/bignumber';
import {
  CollectableAsset,
  CustomContractTransaction,
  SafeTransaction,
  CollectableAssetTransaction,
  TokenAssetTransaction
} from '@/helpers/interfaces';
import { InterfaceDecoder } from './decoder';
import { getNativeAsset } from './coins';
import { ERC20_ABI, ERC721_ABI } from '../constants';
import { fetchTextSignatures } from './index';
import { getContractABI, parseMethodToABI } from './abi';
import { getGnosisSafeToken } from './safe';

export function rawToModuleTransaction({
  to,
  value,
  data,
  nonce
}): SafeTransaction {
  return {
    to,
    value,
    data,
    nonce,
    operation: '0'
  };
}

export function sendAssetToModuleTransaction({
  recipient,
  collectable,
  data,
  nonce
}): CollectableAssetTransaction {
  const _collectable = {
    id: collectable.id,
    name: collectable.name,
    address: collectable.address,
    tokenName: collectable.tokenName,
    logoUri: collectable.logoUri
  };
  return {
    data,
    nonce,
    recipient,
    value: '0',
    operation: '0',
    type: 'transferNFT',
    to: collectable.address,
    collectable: _collectable
  };
}

export function transferFundsToModuleTransaction({
  recipient,
  amount,
  token,
  data,
  nonce
}): TokenAssetTransaction {
  const base = {
    operation: '0',
    nonce,
    token,
    recipient
  };
  if (token.address === 'main') {
    return {
      ...base,
      type: 'transferFunds',
      data: '0x',
      to: recipient,
      amount: parseAmount(amount),
      value: parseAmount(amount)
    };
  }
  return {
    ...base,
    data,
    type: 'transferFunds',
    to: token.address,
    amount: parseAmount(amount),
    value: '0'
  };
}

export function contractInteractionToModuleTransaction(
  { to, value, data, nonce, method },
  multiSendAddress: string
): CustomContractTransaction {
  const operation = to === multiSendAddress ? '1' : '0';
  return {
    to,
    data,
    nonce,
    operation,
    type: 'contractInteraction',
    value: parseValueInput(value),
    abi: parseMethodToABI(method)
  };
}

export async function decodeContractTransaction(
  network: string,
  transaction: SafeTransaction,
  multiSendAddress: string
): Promise<CustomContractTransaction> {
  const decode = (abi: string | FunctionFragment[]) => {
    const contractInterface = new InterfaceDecoder(abi);
    const method = contractInterface.getMethodFragment(transaction.data);
    contractInterface.decodeFunction(transaction.data, method); // Validate data can be decode by method.
    return contractInteractionToModuleTransaction(
      {
        data: transaction.data,
        nonce: 0,
        to: transaction.to,
        value: transaction.value,
        method
      },
      multiSendAddress
    );
  };

  const contractAbi = await getContractABI(network, transaction.to);
  if (contractAbi) return decode(contractAbi);

  const methodSignature = getMethodSignature(transaction.data);
  if (methodSignature) {
    const textSignatures = await fetchTextSignatures(methodSignature);
    for (const signature of textSignatures) {
      try {
        return decode([FunctionFragment.fromString(signature)]);
      } catch (e) {
        console.warn('invalid abi for transaction');
      }
    }
  }

  throw new Error(`we were not able to decode this transaction`);
}

function getMethodSignature(data: string) {
  const methodSignature = data.substr(0, 10);
  if (isHexString(methodSignature) && methodSignature.length === 10) {
    return methodSignature;
  }
  return null;
}

export function isERC20TransferTransaction(transaction: SafeTransaction) {
  // 0xa9059cbb == transfer(address to, uint256 amount)
  return getMethodSignature(transaction.data) === '0xa9059cbb';
}

function decodeERC721TransferTransaction(transaction: SafeTransaction) {
  const erc721ContractInterface = new InterfaceDecoder(ERC721_ABI);
  try {
    return erc721ContractInterface.decodeFunction(transaction.data);
  } catch (e) {
    return null;
  }
}

export async function decodeTransactionData(
  network: string,
  transaction: SafeTransaction,
  multiSendAddress: string
) {
  if (!transaction.data || transaction.data === '0x') {
    return transferFundsToModuleTransaction({
      recipient: transaction.to,
      amount: transaction.value,
      data: '0x',
      token: getNativeAsset(network),
      nonce: 0
    });
  }

  if (isERC20TransferTransaction(transaction)) {
    try {
      const erc20ContractInterface = new InterfaceDecoder(ERC20_ABI);
      const params = erc20ContractInterface.decodeFunction(transaction.data);
      const token = await getGnosisSafeToken(network, transaction.to);
      return transferFundsToModuleTransaction({
        recipient: params[0],
        amount: params[1],
        data: transaction.data,
        nonce: 0,
        token
      });
    } catch (e) {
      console.warn('invalid ERC20 transfer transaction');
    }
  }

  const erc721DecodedParams = decodeERC721TransferTransaction(transaction);
  if (erc721DecodedParams) {
    const collectable: CollectableAsset = {
      id: erc721DecodedParams[2],
      address: transaction.to,
      name: 'Unknown'
    };
    return sendAssetToModuleTransaction({
      collectable,
      nonce: 0,
      data: transaction.data,
      recipient: erc721DecodedParams[1]
    });
  }

  return decodeContractTransaction(network, transaction, multiSendAddress);
}

export function parseAmount(input: string) {
  return BigNumber.from(input).toString();
}

export function parseValueInput(input) {
  try {
    return parseAmount(input);
  } catch (e) {
    return input;
  }
}
