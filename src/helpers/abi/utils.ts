import memoize from 'lodash.memoize';
import { isAddress } from '@ethersproject/address';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { ModuleTransaction } from '@snapshot-labs/snapshot.js/src/plugins/safeSnap';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Interface } from '@ethersproject/abi';
import { pack } from '@ethersproject/solidity';
import { hexDataLength } from '@ethersproject/bytes';
import {
  AbiItem,
  AbiItemExtended,
  AllowedAbiItem
} from '@/helpers/abi/interfaces';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';

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

const MultiSendABI = ['function multiSend(bytes memory transactions)'];

const MULTISEND_CONTRACT_ADDRESS = '0x8D29bE29923b68abfDD21e541b9374737B49cdAD';

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

export const isAllowedMethod = ({ name, type }: AbiItem): boolean => {
  return type === 'function' && !!name;
};

export const getMethodAction = ({
  stateMutability
}: AbiItem): 'read' | 'write' => {
  if (!stateMutability) return 'write';
  return ['view', 'pure'].includes(stateMutability) ? 'read' : 'write';
};

export const extractUsefulMethods = (abi: AbiItem[]): AbiItemExtended[] => {
  const allowedAbiItems = abi.filter(method => {
    return isAllowedMethod(method) && getMethodAction(method) === 'write';
  }) as AllowedAbiItem[];

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

export const getContractTransactionData = (
  abi: string,
  method: AbiItemExtended,
  values: Record<string, string>
) => {
  const contractInterface = new Interface(abi);
  const { inputs, name } = method;
  const parameterValues = inputs?.map(extractMethodArgs(values)) || [];
  return contractInterface.encodeFunctionData(name, parameterValues);
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

export const parseMethodToABI = (method: AbiItemExtended) => {
  return [method];
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

export const removeHexPrefix = (hexString: string) => {
  return hexString.startsWith('0x') ? hexString.substr(2) : hexString;
};

const encodePackageMultiSendTransaction = (transaction: ModuleTransaction) => {
  return pack(
    ['uint8', 'address', 'uint256', 'uint256', 'bytes'],
    [
      transaction.operation,
      transaction.to,
      transaction.value,
      hexDataLength(transaction.data),
      transaction.data
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
  const value: string = transactions.reduce(
    (total, tx) => BigNumber.from(tx.value).add(total).toString(),
    '0'
  );
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
