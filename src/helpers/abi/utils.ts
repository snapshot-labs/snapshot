import memoize from 'lodash.memoize';
import { isAddress } from '@ethersproject/address';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { JsonRpcProvider } from '@ethersproject/providers';
import { id } from '@ethersproject/hash';
import { Interface } from '@ethersproject/abi';

import {
  AbiItem,
  AbiItemExtended,
  AllowedAbiItem
} from '@/helpers/abi/interfaces';
import { isArrayParameter } from '@/helpers/validator';
import { BigNumber } from '@ethersproject/bignumber';

const EXPLORER_API_URLS = {
  '1': 'https://api.etherscan.io/api',
  '4': 'https://api-rinkeby.etherscan.io/api'
};

const fetchContractABI = memoize(
  async (url: string, contractAddress: string, apiKey?: string) => {
    let params: Record<string, string> = {
      module: 'contract',
      action: 'getAbi',
      address: contractAddress
    };

    if (apiKey) {
      params = { ...params, apiKey };
    }

    const response = await fetch(`${url}?${new URLSearchParams(params)}`);

    if (!response.ok) {
      return { status: 0, result: '' };
    }

    return response.json();
  },
  (url, contractAddress) => `${url}_${contractAddress}`
);

export const mustBeEthereumAddress = memoize((address: string) => {
  const startsWith0x = address?.startsWith('0x');
  const isValidAddress = isAddress(address);
  return startsWith0x && isValidAddress;
});

export const mustBeEthereumContractAddress = memoize(
  async (network: string, address: string) => {
    const provider = getProvider(network) as JsonRpcProvider;
    const contractCode = await provider.getCode(address);

    return (
      contractCode && contractCode.replace('0x', '').replace(/0/g, '') !== ''
    );
  },
  (url, contractAddress) => `${url}_${contractAddress}`
);

export const getContractABI = async (
  network: string,
  contractAddress: string
): Promise<string> => {
  const apiKey = process.env.VUE_APP_ETHERSCAN_API_KEY;
  const apiUrl = EXPLORER_API_URLS[network];

  if (!apiUrl) {
    return '';
  }

  const isEthereumAddress = mustBeEthereumAddress(contractAddress);
  const isEthereumContractAddress = await mustBeEthereumContractAddress(
    network,
    contractAddress
  );

  if (!isEthereumAddress || !isEthereumContractAddress) {
    return '';
  }

  try {
    const { result, status } = await fetchContractABI(
      apiUrl,
      contractAddress,
      apiKey
    );

    if (status === '0') {
      return '';
    }

    return result;
  } catch (e) {
    console.error('Failed to retrieve ABI', e);
    return '';
  }
};

export const isAllowedMethod = ({ name, type }: AbiItem): boolean => {
  return type === 'function' && !!name;
};

export const getMethodAction = ({
  stateMutability
}: AbiItem): 'read' | 'write' => {
  if (!stateMutability) {
    return 'write';
  }

  return ['view', 'pure'].includes(stateMutability) ? 'read' : 'write';
};

export const extractUsefulMethods = (abi: AbiItem[]): AbiItemExtended[] => {
  const allowedAbiItems = abi.filter(isAllowedMethod) as AllowedAbiItem[];

  return allowedAbiItems
    .map(
      (method): AbiItemExtended => ({
        action: getMethodAction(method),
        ...method
      })
    )
    .sort(({ name: a }, { name: b }) => {
      return a.toLowerCase() > b.toLowerCase() ? 1 : -1;
    });
};

export const getParsedJSONOrArrayFromString = (
  parameter: string
): (string | number)[] | null => {
  try {
    const arrayResult = JSON.parse(parameter);
    return arrayResult.map(value => {
      if (Number.isInteger(value)) {
        return BigNumber.from(value).toString();
      }
      return value;
    });
  } catch (err) {
    return null;
  }
};

const extractMethodArgs = (values: Record<string, string>) => ({ name }) => {
  return getParsedJSONOrArrayFromString(values[name]) || values[name];
};

export const getTransactionData = (
  abi: string,
  method: AbiItemExtended,
  contractAddress: string,
  values: Record<string, string>
) => {
  const contractInterface = new Interface(abi);
  const { inputs, name } = method;
  const parameterValues = inputs?.map(extractMethodArgs(values)) || [];

  console.log({ parameterValues });

  return contractInterface.encodeFunctionData(name, parameterValues);
};
