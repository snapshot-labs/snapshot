import {
  FunctionFragment,
  Interface,
  ParamType,
  Result
} from '@ethersproject/abi';
import { isAddress } from '@ethersproject/address';
import { hexDataLength, isHexString } from '@ethersproject/bytes';
import { BigNumber } from '@ethersproject/bignumber';
import { pack } from '@ethersproject/solidity';
import { FormError } from './interfaces';
import ERC20_ABI from './abi/ERC20.json';
import ERC721_ABI from './abi/ERC721.json';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { call } from '@snapshot-labs/snapshot.js/src/utils';

export const MULTI_SEND_ABI = [
  'function multiSend(bytes transactions) payable'
];

export enum MULTI_SEND_CONTRACT_ADDRESSES_V1_3_0 {
  CHAIN_1 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_3 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_4 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_10 = '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  CHAIN_28 = '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  CHAIN_42 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_5 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_56 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_69 = '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  CHAIN_100 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_122 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_123 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_137 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_246 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_288 = '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  CHAIN_588 = '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  CHAIN_1088 = '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  CHAIN_1285 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_1287 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_4002 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_42161 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_42220 = '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  CHAIN_43114 = '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  CHAIN_73799 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_80001 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_333999 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_1313161554 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  CHAIN_1313161555 = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761'
}

export enum TransactionOperationType {
  CALL,
  DELEGATECALL
}

export enum TransactionForms {
  FUNDS = 'funds',
  NFT = 'nft',
  CONTRACT = 'contract'
  // UNISWAP = 'uniswap',
  // DEPLOY = 'deploy'
}

export type Transaction = {
  to: string;
  value: BigNumber;
  data: string;
  operation: TransactionOperationType;
  abi?: string;
};

export type ExecutableTransaction = Omit<Transaction, 'abi'>;

export type MultisendTransaction = ExecutableTransaction & {
  to: MULTI_SEND_CONTRACT_ADDRESSES_V1_3_0;
  operation: TransactionOperationType.DELEGATECALL;
};

export function convertToExecutableTransaction(
  transaction: Transaction
): ExecutableTransaction {
  const { to, value, data, operation } = transaction;

  return {
    to,
    value,
    data,
    operation
  };
}

export function encodeTransactionsForMultisend(transactions: Transaction[]) {
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

export function convertBatchToMultisendTransaction(
  batch: ExecutableTransaction[],
  chainId: string
): MultisendTransaction {
  const multiSendContract = new Interface(MULTI_SEND_ABI);
  const transactionsEncoded = encodeTransactionsForMultisend(batch);
  const data = multiSendContract.encodeFunctionData('multiSend', [
    transactionsEncoded
  ]);
  return {
    to: MULTI_SEND_CONTRACT_ADDRESSES_V1_3_0[`CHAIN_${chainId}`],
    operation: TransactionOperationType.DELEGATECALL,
    value: BigNumber.from(0),
    data
  };
}

export function encodeERC20TransferData(
  recipient: string,
  amount: BigNumber
): string {
  const contractInterface = new Interface(ERC20_ABI);
  return contractInterface.encodeFunctionData('transfer', [recipient, amount]);
}

export function decodeERC20TransferData(data: string): Result {
  const contractInterface = new Interface(ERC20_ABI);
  const method = contractInterface.getFunction('transfer');

  return contractInterface.decodeFunctionData(method, data);
}

export function encodeERC721TransferData(
  from: string,
  recipient: string,
  tokenId: BigNumber
): string {
  const contractInterface = new Interface(ERC721_ABI);
  return contractInterface.encodeFunctionData('safeTransferFrom', [
    from,
    recipient,
    tokenId
  ]);
}

export function decodeERC721TransferData(data: string): Result {
  const contractInterface = new Interface(ERC721_ABI);
  const method = contractInterface.getFunction('safeTransferFrom');

  return contractInterface.decodeFunctionData(method, data);
}

export function encodeContractData(
  abi: string,
  method: FunctionFragment,
  paramValues: ParamValue[]
) {
  const contractInterface = new Interface(abi);
  return contractInterface.encodeFunctionData(method, paramValues);
}

export function decodeContractData(
  data: string,
  abiString: string
): { method: FunctionFragment; values: Result } {
  const contractInterface = new Interface(abiString);
  const method = contractInterface.getFunction(data.slice(0, 10));
  const values = contractInterface.decodeFunctionData(method, data);

  return { method, values };
}

enum FunctionSignatures {
  ERC20_TRANSFER = '0xa9059cbb',
  ERC721_SAFE_TRANSFER_FROM = '0x42842e0e',
  ERC721_SAFE_TRANSFER_FROM_TO_CONTRACT = '0xb88d4fde'
}

export function detectTransactionForm(
  transaction: Transaction
): TransactionForms {
  const functionSignature = transaction.data.slice(0, 10);

  if (
    functionSignature === FunctionSignatures.ERC721_SAFE_TRANSFER_FROM ||
    functionSignature ===
      FunctionSignatures.ERC721_SAFE_TRANSFER_FROM_TO_CONTRACT
  ) {
    return TransactionForms.NFT;
  }

  if (
    functionSignature === FunctionSignatures.ERC20_TRANSFER ||
    (functionSignature === '0x' && transaction.value.gt(0))
    // TODO: also check ERC20 amount > 0 by decoding data
  ) {
    return TransactionForms.FUNDS;
  }

  return TransactionForms.CONTRACT;
}

export type ParamValue = boolean | string | BigNumber | ParamValue[];
export type ParamValueError = FormError | null | ParamValueError[];

// this can probably be replaced with some ethers function but I couldn't find
// anything that worked
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
