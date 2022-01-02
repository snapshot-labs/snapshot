import memoize from 'lodash/memoize';
import { isAddress } from '@ethersproject/address';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { ModuleTransaction } from '@/../snapshot-plugins/src/plugins/safeSnap';
import { JsonRpcProvider } from '@ethersproject/providers';
import { pack } from '@ethersproject/solidity';
import { hexDataLength, isHexString } from '@ethersproject/bytes';
import {
  FormatTypes,
  Fragment,
  FunctionFragment,
  Interface,
  ParamType
} from '@ethersproject/abi';
import { BigNumberish } from '@ethersproject/bignumber';
import { JsonFragment } from '@ethersproject/abi/src.ts/fragments';
import { InterfaceDecoder } from '@/helpers/abi/decoder';
import { parseAmount, parseValueInput } from '@/helpers/utils';

interface Collectable {
  id: string;
  name: string;
  address: string;
  tokenName?: string;
  logoUri?: string;
}

interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoUri: string;
}

export interface SendAssetModuleTransaction extends ModuleTransaction {
  type: 'transferNFT';
  recipient: string;
  collectable: Collectable;
}

export interface TransferFundsModuleTransaction extends ModuleTransaction {
  type: 'transferFunds';
  amount: string;
  recipient: any;
  token: Token;
}

export interface ContractInteractionModuleTransaction
  extends ModuleTransaction {
  type: 'contractInteraction';
  abi: string[];
}

const EXPLORER_API_URLS = {
  '1': 'https://api.etherscan.io/api',
  '4': 'https://api-rinkeby.etherscan.io/api',
  '100': 'https://blockscout.com/xdai/mainnet/api',
  '73799': 'https://volta-explorer.energyweb.org/api',
  '246': 'https://explorer.energyweb.org/api',
  '137': 'https://api.polygonscan.com/api',
  '56': 'https://api.bscscan.com/api',
  '42161': 'https://api.arbiscan.io/api'
};

const GNOSIS_SAFE_TRANSACTION_API_URLS = {
  '1': 'https://safe-transaction.gnosis.io/api/v1/',
  '4': 'https://safe-transaction.rinkeby.gnosis.io/api/v1/',
  '100': 'https://safe-transaction.xdai.gnosis.io/api/v1/',
  '73799': 'https://safe-transaction.volta.gnosis.io/api/v1/',
  '246': 'https://safe-transaction.ewc.gnosis.io/api/v1/',
  '137': 'https://safe-transaction.polygon.gnosis.io/api/v1/',
  '56': 'https://safe-transaction.bsc.gnosis.io/api/v1/',
  '42161': 'https://safe-transaction.arbitrum.gnosis.io/api/v1/'
};

const ERC20ContractABI = [
  'function transfer(address recipient, uint256 amount) public virtual override returns (bool)'
];

const ERC721ContractABI = [
  'function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable'
];

const MultiSendABI = ['function multiSend(bytes memory transactions)'];

const MULTISEND_CONTRACT_ADDRESS = '0x8D29bE29923b68abfDD21e541b9374737B49cdAD';

export const ETHEREUM_COIN: Token = {
  name: 'Ethereum',
  decimals: 18,
  symbol: 'ETH',
  logoUri:
    'https://safe-transaction-assets.gnosis-safe.io/chains/1/currency_logo.png',
  address: 'main'
};

type ABI = string | Array<Fragment | JsonFragment | string>;

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

const extractMethodArgs = (values: string[]) => (param: ParamType, index) => {
  const value = values[index];
  if (param.baseType === 'array') {
    return JSON.parse(value);
  }
  return value;
};

export const getContractTransactionData = (
  abi: string,
  method: FunctionFragment,
  values: string[]
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
    const endpointPath = `/safes/${safeAddress}/balances/`;
    return callGnosisSafeTransactionApi(network, endpointPath);
  },
  (safeAddress, network) => `${safeAddress}_${network}`
);

export const getGnosisSafeCollectibles = memoize(
  (network, safeAddress) => {
    const endpointPath = `/safes/${safeAddress}/collectibles/`;
    return callGnosisSafeTransactionApi(network, endpointPath);
  },
  (safeAddress, network) => `${safeAddress}_${network}`
);

export const getGnosisSafeToken = memoize(
  async (network, tokenAddress): Promise<Token> => {
    const endpointPath = `/tokens/${tokenAddress}`;
    return callGnosisSafeTransactionApi(network, endpointPath);
  },
  (tokenAddress, network) => `${tokenAddress}_${network}`
);

export const removeHexPrefix = (hexString: string) => {
  return hexString.startsWith('0x') ? hexString.substr(2) : hexString;
};

const encodePackageMultiSendTransaction = (transaction: ModuleTransaction) => {
  const data = transaction.data || '0x';
  return pack(
    ['uint8', 'address', 'uint256', 'uint256', 'bytes'],
    [
      transaction.operation,
      transaction.to,
      transaction.value,
      hexDataLength(data),
      data
    ]
  );
};

export const multiSendTransaction = (
  transactions: ModuleTransaction[] | ModuleTransaction,
  nonce: number
): ModuleTransaction => {
  if (!Array.isArray(transactions)) return transactions;

  const multiSendContract = new Interface(MultiSendABI);
  const transactionsEncoded =
    '0x' +
    transactions
      .map(encodePackageMultiSendTransaction)
      .map(removeHexPrefix)
      .join('');
  const value = '0';
  const data = multiSendContract.encodeFunctionData('multiSend', [
    transactionsEncoded
  ]);

  return {
    to: MULTISEND_CONTRACT_ADDRESS,
    operation: '1',
    value,
    nonce: nonce.toString(),
    data
  };
};

export const formatBatchTransaction = (
  batch: ModuleTransaction[],
  nonce = 0
): ModuleTransaction => {
  if (batch.length === 1) {
    return { ...batch[0], nonce: nonce.toString() };
  }
  return multiSendTransaction(batch, nonce);
};

const shrinkCollectableData = (collectable): Collectable => {
  return {
    id: collectable.id,
    name: collectable.name,
    address: collectable.address,
    tokenName: collectable.tokenName,
    logoUri: collectable.logoUri
  };
};

export const rawToModuleTransaction = ({
  to,
  value,
  data,
  nonce
}): ModuleTransaction => {
  return {
    to,
    value,
    data,
    nonce,
    operation: '0'
  };
};

export const sendAssetToModuleTransaction = ({
  recipient,
  collectable,
  data,
  nonce
}): SendAssetModuleTransaction => {
  return {
    data,
    nonce,
    recipient,
    value: '0',
    operation: '0',
    type: 'transferNFT',
    to: collectable.address,
    collectable: shrinkCollectableData(collectable)
  };
};

export const transferFundsToModuleTransaction = ({
  recipient,
  amount,
  token,
  data,
  nonce
}): TransferFundsModuleTransaction => {
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
};

export const contractInteractionToModuleTransaction = ({
  to,
  value,
  data,
  nonce,
  method
}): ContractInteractionModuleTransaction => {
  return {
    to,
    data,
    nonce,
    operation: getOperation(to),
    type: 'contractInteraction',
    value: parseValueInput(value),
    abi: parseMethodToABI(method)
  };
};

export const fetchTextSignatures = async (
  methodSignature: string
): Promise<string[]> => {
  const url = new URL('/api/v1/signatures', 'https://www.4byte.directory');
  url.searchParams.set('hex_signature', methodSignature);
  url.searchParams.set('ordering', 'created_at');
  const response = await fetch(url.toString());
  const { results } = await response.json();
  return results.map(signature => signature.text_signature);
};

const getMethodSignature = (data: string) => {
  const methodSignature = data.substr(0, 10);
  if (isHexString(methodSignature) && methodSignature.length === 10) {
    return methodSignature;
  }
  return null;
};

export const decodeContractTransaction = async (
  network: string,
  transaction: ModuleTransaction
): Promise<ContractInteractionModuleTransaction> => {
  const decode = (abi: string | FunctionFragment[]) => {
    const contractInterface = new InterfaceDecoder(abi);
    const method = contractInterface.getMethodFragment(transaction.data);
    contractInterface.decodeFunction(transaction.data, method); // Validate data can be decode by method.
    return contractInteractionToModuleTransaction({
      data: transaction.data,
      nonce: 0,
      to: transaction.to,
      value: transaction.value,
      method
    });
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
};

export const isERC20TransferTransaction = (transaction: ModuleTransaction) => {
  return getMethodSignature(transaction.data) === '0xa9059cbb';
};

export const decodeERC721TransferTransaction = (
  transaction: ModuleTransaction
) => {
  const erc721ContractInterface = new InterfaceDecoder(ERC721ContractABI);
  try {
    return erc721ContractInterface.decodeFunction(transaction.data);
  } catch (e) {
    return null;
  }
};

export const decodeTransactionData = async (
  network: string,
  transaction: ModuleTransaction
) => {
  if (!transaction.data || transaction.data === '0x') {
    return transferFundsToModuleTransaction({
      recipient: transaction.to,
      amount: transaction.value,
      data: '0x',
      token: ETHEREUM_COIN,
      nonce: 0
    });
  }

  if (isERC20TransferTransaction(transaction)) {
    try {
      const erc20ContractInterface = new InterfaceDecoder(ERC20ContractABI);
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
    const collectable: Collectable = {
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

  return decodeContractTransaction(network, transaction);
};
