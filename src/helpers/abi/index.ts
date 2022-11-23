import memoize from 'lodash/memoize';
import {
  FormatTypes,
  Fragment,
  FunctionFragment,
  Interface,
  JsonFragment,
  Result
} from '@ethersproject/abi';
import { isAddress } from '@ethersproject/address';
import { BigNumber } from '@ethersproject/bignumber';

import ERC20_ABI from '@/helpers/abi/ERC20.json';
import ERC721_ABI from '@/helpers/abi/ERC721.json';

export enum KnownFunctionSignatures {
  ERC20_TRANSFER = '0xa9059cbb',
  ERC721_SAFE_TRANSFER_FROM = '0x42842e0e',
  ERC721_SAFE_TRANSFER_FROM_TO_CONTRACT = '0xb88d4fde'
}

export const EXPLORER_API_URLS = {
  '1': 'https://api.etherscan.io/api',
  '4': 'https://api-rinkeby.etherscan.io/api',
  '5': 'https://api-goerli.etherscan.io/api',
  '100': 'https://blockscout.com/xdai/mainnet/api',
  '73799': 'https://volta-explorer.energyweb.org/api',
  '246': 'https://explorer.energyweb.org/api',
  '137': 'https://api.polygonscan.com/api',
  '56': 'https://api.bscscan.com/api',
  '42161': 'https://api.arbiscan.io/api'
};

export type ABI = string | Array<Fragment | JsonFragment | string>;

export type ParamValue = boolean | string | BigNumber | ParamValue[];

const fetchContractABI = memoize(
  async (url: string, contractAddress: string) => {
    if (!isAddress(contractAddress)) throw new Error('Invalid address');

    const params = new URLSearchParams({
      module: 'contract',
      action: 'getAbi',
      address: contractAddress
    });

    const response = await fetch(`${url}?${params}`);

    if (!response.ok) {
      return { status: 0, result: '' };
    }

    return response.json();
  },
  (url, contractAddress) => `${url}_${contractAddress}`
);

export async function getContractABI(
  network: string,
  contractAddress: string
): Promise<string> {
  const apiUrl = EXPLORER_API_URLS[network];

  if (!apiUrl) {
    console.error(`No explorer URL for network ${network}.`);
    return '';
  }

  try {
    const { result, status } = await fetchContractABI(apiUrl, contractAddress);

    if (status === '0') {
      return '';
    }

    return result;
  } catch (e) {
    console.error('Failed to retrieve ABI', e);
    return '';
  }
}

export function parseMethodToABI(method: FunctionFragment) {
  return [method.format(FormatTypes.full)];
}

export function getABIWriteFunctions(abi: Interface) {
  return abi.fragments
    .filter(FunctionFragment.isFunctionFragment)
    .map(FunctionFragment.fromObject)
    .filter(fragment => !['view', 'pure'].includes(fragment.stateMutability))
    .sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1));
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
