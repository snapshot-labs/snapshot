import memoize from 'lodash.memoize';
import { isAddress } from '@ethersproject/address';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { JsonRpcProvider } from '@ethersproject/providers';
import {
  Fragment,
  FunctionFragment,
  Interface,
  ParamType,
  FormatTypes
} from '@ethersproject/abi';
import { BigNumberish } from '@ethersproject/bignumber';
import { JsonFragment } from '@ethersproject/abi/src.ts/fragments';

const EXPLORER_API_URLS = {
  '1': 'https://api.etherscan.io/api',
  '4': 'https://api-rinkeby.etherscan.io/api'
};

const GNOSIS_SAFE_TRANSACTION_API_URLS = {
  '1': 'https://safe-transaction.gnosis.io/api/v1/',
  '4': 'https://safe-transaction.rinkeby.gnosis.io/api/v1/'
};

const ERC20ContractABI = [
  'function transfer(address recipient, uint256 amount) public virtual override returns (bool)'
];

const ERC721ContractABI = [
  'function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable'
];

const MULTISEND_CONTRACT_ADDRESS = '0x8D29bE29923b68abfDD21e541b9374737B49cdAD';

type ABI = string | ReadonlyArray<Fragment | JsonFragment | string>;

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

const fetchContractABI = memoize(
  async (url: string, contractAddress: string) => {
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

export const getContractABI = async (
  network: string,
  contractAddress: string
): Promise<string> => {
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
    const { result, status } = await fetchContractABI(apiUrl, contractAddress);

    if (status === '0') {
      return '';
    }

    return result;
  } catch (e) {
    console.error('Failed to retrieve ABI', e);
    return '';
  }
};

export const isWriteFunction = (method: FunctionFragment) => {
  if (!method.stateMutability) return true;
  return !['view', 'pure'].includes(method.stateMutability);
};

export const getABIWriteFunctions = (abi: Fragment[]) => {
  const abiInterface = new Interface(abi);
  return (
    abiInterface.fragments
      // Return only contract's functions
      .filter(FunctionFragment.isFunctionFragment)
      .map(FunctionFragment.fromObject)
      // Return only write functions
      .filter(isWriteFunction)
      // Sort by name
      .sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1))
  );
};

const extractMethodArgs =
  (values: Record<string, string>) => (param: ParamType) => {
    const value = values[param.name];
    if (param.baseType === 'array') {
      return JSON.parse(value);
    }
    return value;
  };

export const getContractTransactionData = (
  abi: string,
  method: FunctionFragment,
  values: Record<string, string>
) => {
  const contractInterface = new Interface(abi);
  const parameterValues = method.inputs.map(extractMethodArgs(values));
  return contractInterface.encodeFunctionData(method, parameterValues);
};

export const getAbiFirstFunctionName = (abi: ABI): string => {
  const abiInterface = new Interface(abi);
  return abiInterface.fragments[0].name;
};

export const getERC20TokenTransferTransactionData = (
  recipientAddress: string,
  amount: BigNumberish
): string => {
  const contractInterface = new Interface(ERC20ContractABI);
  return contractInterface.encodeFunctionData('transfer', [
    recipientAddress,
    amount
  ]);
};

export const getERC721TokenTransferTransactionData = (
  fromAddress: string,
  recipientAddress: string,
  id: BigNumberish
): string => {
  const contractInterface = new Interface(ERC721ContractABI);
  return contractInterface.encodeFunctionData('safeTransferFrom', [
    fromAddress,
    recipientAddress,
    id
  ]);
};

export const getOperation = to => {
  if (to === MULTISEND_CONTRACT_ADDRESS) return '1';
  return '0';
};

export const parseMethodToABI = (method: FunctionFragment) => {
  return [method.format(FormatTypes.full)];
};

const callGnosisSafeTransactionApi = async (network: string, url: string) => {
  const apiUrl = GNOSIS_SAFE_TRANSACTION_API_URLS[network];
  const response = await fetch(apiUrl + url);
  return response.json();
};

export const getGnosisSafeBalances = memoize(
  (network, safeAddress) => {
    const endpointPath = `/safes/${safeAddress}/balances`;
    return callGnosisSafeTransactionApi(network, endpointPath);
  },
  (safeAddress, network) => `${safeAddress}_${network}`
);

export const getGnosisSafeCollecibles = memoize(
  (network, safeAddress) => {
    const endpointPath = `/safes/${safeAddress}/collectibles`;
    return callGnosisSafeTransactionApi(network, endpointPath);
  },
  (safeAddress, network) => `${safeAddress}_${network}`
);
