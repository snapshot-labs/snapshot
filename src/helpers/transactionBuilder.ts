import { call, getUrl } from '@snapshot-labs/snapshot.js/src/utils';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { ParamType } from '@ethersproject/abi';
import { isAddress } from '@ethersproject/address';
import { BigNumber } from '@ethersproject/bignumber';
import { isHexString } from '@ethersproject/bytes';
import { FormError } from './interfaces';
import ERC20_ABI from '@/helpers/abi/ERC20.json';
import ERC721_ABI from '@/helpers/abi/ERC721.json';
import { Transaction } from '@/helpers/safe';
import { KnownFunctionSignatures, ParamValue } from '@/helpers/abi';

export enum TransactionForms {
  FUNDS = 'funds',
  NFT = 'nft',
  CONTRACT = 'contract'
  // UNISWAP = 'uniswap',
  // DEPLOY = 'deploy'
}

export function detectTransactionForm(
  transaction: Transaction
): TransactionForms {
  const functionSignature = transaction.data.slice(0, 10);
  if (
    functionSignature === KnownFunctionSignatures.ERC721_SAFE_TRANSFER_FROM ||
    functionSignature ===
      KnownFunctionSignatures.ERC721_SAFE_TRANSFER_FROM_TO_CONTRACT
  ) {
    return TransactionForms.NFT;
  }

  if (
    functionSignature === KnownFunctionSignatures.ERC20_TRANSFER ||
    (functionSignature === '0x' && BigNumber.from(transaction.value).gt(0))
    // TODO: also check ERC20 amount > 0 by decoding data
  ) {
    return TransactionForms.FUNDS;
  }

  return TransactionForms.CONTRACT;
}

export type ParamValueError = FormError | null | ParamValueError[];

export function validateBytesString(
  bytesString: string,
  bytesType: string
): FormError | null {
  if (!bytesString.startsWith('0x'))
    return { message: 'Bytes must start with 0x' };

  if (!isHexString(bytesString))
    return { message: 'Bytes must be a valid hex string' };

  const requiredBytesLength = Number(bytesType.replace('bytes', ''));
  const requiredBytesStringLength = requiredBytesLength * 2;

  const bytesStringWithout0x = bytesString.slice(2);

  if (requiredBytesStringLength === 0) {
    if (bytesStringWithout0x.length % 2 !== 0) {
      return { message: 'Bytes string must be even length' };
    }

    return null;
  }

  if (bytesStringWithout0x.length !== requiredBytesStringLength)
    return {
      message: `Requires exactly ${requiredBytesLength} bytes`
    };

  return null;
}

export function validateIntString(
  intString: string,
  intType: string
): FormError | null {
  const allowOnlyPositive = intType.startsWith('u');
  const maxBits = Number(intType.replace(/^\D+/, ''));

  const minNumber = allowOnlyPositive
    ? BigNumber.from(0)
    : BigNumber.from(-2).pow(maxBits - 1);
  const maxNumber = allowOnlyPositive
    ? BigNumber.from(2).pow(maxBits).sub(1)
    : BigNumber.from(2)
        .pow(maxBits - 1)
        .sub(1);

  let bigNumber: BigNumber;

  try {
    bigNumber = BigNumber.from(intString);
  } catch (e) {
    return { message: 'Invalid number' };
  }

  if (allowOnlyPositive && bigNumber.isNegative())
    return {
      message: 'Only positive numbers are allowed'
    };

  if (bigNumber.gt(maxNumber))
    return {
      message: `Number is too large for ${maxBits} bits`
    };

  if (bigNumber.lt(minNumber))
    return {
      message: `Number is too small for ${maxBits} bits`
    };

  return null;
}

export function validateAddress(address: string): FormError | null {
  if (!isAddress(address)) return { message: 'Address is not valid' };

  return null;
}

export function validateAllParamValues(
  params: ParamType[],
  values: ParamValue[]
): boolean {
  return params
    .map((param, index) => {
      const value = values[index];

      if (value === undefined) return false;

      if (param.baseType === 'tuple')
        return validateAllParamValues(param.components, value as ParamValue[]);

      if (param.baseType === 'array') {
        if (!Array.isArray(value)) return false;

        if (value.length === 0) return true;

        return validateAllParamValues(
          Array(value.length).fill(ParamType.from(param.arrayChildren)),
          value as ParamValue[]
        );
      }

      if (param.baseType === 'address')
        return validateAddress(value as string) === null;

      if (param.baseType.startsWith('bytes'))
        return validateBytesString(value as string, param.baseType) === null;

      if (param.baseType.startsWith('int') || param.baseType.startsWith('uint'))
        return validateIntString(value as string, param.baseType) === null;

      if (param.baseType === 'bool' || param.baseType === 'string') return true;

      return false;
    })
    .every(isValid => isValid);
}

export function bigNumberValuesToString(value: ParamValue): ParamValue {
  if (Array.isArray(value)) return value.map(bigNumberValuesToString);
  if (BigNumber.isBigNumber(value)) return value.toString();
  return value;
}

export type TokenInfo = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
};

export const tokenInfo: TokenInfo[] = [];

export async function getTokenInfo(
  address: string,
  network: string
): Promise<TokenInfo> {
  const existingInfo = tokenInfo.find(token => token.address === address);
  if (existingInfo) return existingInfo;

  const readProvider = getProvider(network);
  const tokenInfoCalls = await Promise.all([
    call(readProvider, ERC20_ABI, [address, 'name', []]),
    call(readProvider, ERC20_ABI, [address, 'symbol', []]),
    call(readProvider, ERC20_ABI, [address, 'decimals', []])
  ]);

  const newTokenInfo = {
    address,
    name: tokenInfoCalls[0],
    symbol: tokenInfoCalls[1],
    decimals: tokenInfoCalls[2]
  };

  tokenInfo.push(newTokenInfo);

  return newTokenInfo;
}

export type NFTInfo = {
  address: string;
  tokenId: BigNumber;
  collectionName: string;
  symbol: string;
  metadata: Record<string, any>;
};

export const nftInfo: NFTInfo[] = [];

export async function getNFTInfo(
  address: string,
  tokenId: BigNumber,
  network: string
): Promise<NFTInfo> {
  const existingInfo = nftInfo.find(
    token => token.address === address && token.tokenId === tokenId
  );
  if (existingInfo) return existingInfo;
  const readProvider = getProvider(network);
  const nftInfoCalls = await Promise.all([
    call(readProvider, ERC721_ABI, [address, 'name', []]),
    call(readProvider, ERC721_ABI, [address, 'symbol', []]),
    call(readProvider, ERC721_ABI, [address, 'tokenURI', [tokenId]])
  ]);

  const metadata = await fetch(getUrl(nftInfoCalls[2])).then(res => res.json());

  const newNftInfo = {
    address,
    tokenId,
    collectionName: nftInfoCalls[0],
    symbol: nftInfoCalls[1],
    metadata
  };

  nftInfo.push(newNftInfo);

  return newNftInfo;
}
