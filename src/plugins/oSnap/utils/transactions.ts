import {
  CollectableAsset,
  CollectableAssetTransaction
} from '@/helpers/interfaces';
import { FunctionFragment } from '@ethersproject/abi';
import { BigNumber } from '@ethersproject/bignumber';
import { isHexString } from '@ethersproject/bytes';
import { ERC20_ABI, ERC721_ABI } from '../constants';
import { BaseTransaction, ContractInteractionTransaction, NFT, Network, RawTransaction, Token, TransferFundsTransaction, TransferNftTransaction } from '../types';
import { encodeMethodAndParams, getContractABI, parseMethodToABI } from './abi';
import { getNativeAsset } from './coins';
import { InterfaceDecoder } from './decoder';
import { fetchTextSignatures } from './index';
import { getGnosisSafeToken } from './safe';
import { createFormattedOptimisticGovernorTransaction } from './umaModule';

export function sendAssetToModuleTransaction({
  recipient,
  collectable,
  data,
  nonce
}: {
  recipient: string;
  collectable: CollectableAsset;
  data: string;
  nonce: string;
}): CollectableAssetTransaction {
  return {
    data,
    nonce,
    recipient,
    value: '0',
    operation: '0',
    type: 'transferNFT',
    to: collectable.address,
    collectable
  };
}

export function createRawTransaction(params: {
  to: string;
  value: string;
  data: string;
}): RawTransaction {
  const type = 'raw';
  const formatted = createFormattedOptimisticGovernorTransaction(params);
  return {
    ...params,
    type,
    formatted,
  }
}

export function createTransferNftTransaction(params: {
  recipient: string,
  collectable: NFT,
  data: string,
}): TransferNftTransaction {
  const type = 'transferNFT';
  const to = params.collectable.address;
  const value = '0';
  const data = params.data;
  const formatted = createFormattedOptimisticGovernorTransaction({
    to,
    value,
    data
  });

  return {
    ...params,
    type,
    to,
    value,
    data,
    formatted,
  }
}

export function createTransferFundsTransaction(params: {
  recipient: string;
  amount: string;
  token: Token;
  data: string;
}): TransferFundsTransaction {
  const type = 'transferFunds';
  const isNativeToken = params.token.address === 'main';
  const data = isNativeToken ? '0x' : params.data;
  const to = isNativeToken ? params.recipient : params.token.address;
  const amount = parseAmount(params.amount);
  const value = isNativeToken ? amount : '0';
  const formatted = createFormattedOptimisticGovernorTransaction({
    to,
    value,
    data,
  })
  return {
    ...params,
    type,
    data,
    to,
    value,
    amount,
    formatted,
  }
}

export function createContractInteractionTransaction(params: {
  to: string;
  value: string;
  abi: string;
  method: FunctionFragment;
  parameters: string[];
}): ContractInteractionTransaction {
  const type = 'contractInteraction';
  const data = encodeMethodAndParams(
    params.abi,
    params.method,
    params.parameters
  );
  const formatted = createFormattedOptimisticGovernorTransaction({...params, data });
  return {
    ...params,
    data,
    type,
    formatted,
  }
}

export function contractInteractionToModuleTransaction(
  params: {
    to: string;
    value: string;
    data: string;
    nonce: string;
    method: FunctionFragment;
  }
) {
  return {
    ...params,
    value: parseValueInput(params.value),
    abi: parseMethodToABI(params.method)
  };
}

export async function decodeContractTransaction(
  network: string,
  transaction: BaseTransaction,
) {
  const decode = (abi: string | FunctionFragment[]) => {
    const contractInterface = new InterfaceDecoder(abi);
    const method = contractInterface.getMethodFragment(transaction.data);
    contractInterface.decodeFunction(transaction.data, method); // Validate data can be decode by method.
    return contractInteractionToModuleTransaction(
      {
        data: transaction.data,
        nonce: '0',
        to: transaction.to,
        value: transaction.value,
        method: method as FunctionFragment
      },
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
  const methodSignature = data.slice(0, 10);
  if (isHexString(methodSignature) && methodSignature.length === 10) {
    return methodSignature;
  }
  return null;
}

export function isERC20TransferTransaction(transaction: BaseTransaction) {
  // 0xa9059cbb == transfer(address to, uint256 amount)
  return getMethodSignature(transaction.data) === '0xa9059cbb';
}

function decodeERC721TransferTransaction(transaction: BaseTransaction) {
  const erc721ContractInterface = new InterfaceDecoder(ERC721_ABI);
  try {
    return erc721ContractInterface.decodeFunction(transaction.data);
  } catch (e) {
    return null;
  }
}

export async function decodeTransactionData(
  network: Network,
  transaction: BaseTransaction,
) {
  if (!transaction.data || transaction.data === '0x') {
    return createTransferFundsTransaction({
      recipient: transaction.to,
      amount: transaction.value,
      data: '0x',
      token: getNativeAsset(network),
      nonce: '0'
    });
  }

  if (isERC20TransferTransaction(transaction)) {
    try {
      const erc20ContractInterface = new InterfaceDecoder(ERC20_ABI);
      const params = erc20ContractInterface.decodeFunction(transaction.data);
      const token = await getGnosisSafeToken(network, transaction.to);
      return createTransferFundsTransaction({
        recipient: params[0],
        amount: params[1],
        data: transaction.data,
        nonce: '0',
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
      nonce: '0',
      data: transaction.data,
      recipient: erc721DecodedParams[1]
    });
  }

  return decodeContractTransaction(network, transaction);
}

export function parseAmount(input: string) {
  return BigNumber.from(input).toString();
}

export function parseValueInput(input: string) {
  try {
    return parseAmount(input);
  } catch (e) {
    return input;
  }
}
