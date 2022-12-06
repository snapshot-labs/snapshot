import { ComputedRef, Ref } from 'vue';
import { Interface } from '@ethersproject/abi';
import { BigNumber } from '@ethersproject/bignumber';
import { hexDataLength } from '@ethersproject/bytes';
import { pack } from '@ethersproject/solidity';
import MULTISEND_ABI from './abi/MULTISEND.json';

const SAFE_TRANSACTION_API_URLS = {
  '1': 'https://safe-transaction.gnosis.io/api/v1/',
  '4': 'https://safe-transaction.rinkeby.gnosis.io/api/v1/',
  '5': 'https://safe-transaction.goerli.gnosis.io/api/v1/',
  '100': 'https://safe-transaction.xdai.gnosis.io/api/v1/',
  '73799': 'https://safe-transaction.volta.gnosis.io/api/v1/',
  '246': 'https://safe-transaction.ewc.gnosis.io/api/v1/',
  '137': 'https://safe-transaction.polygon.gnosis.io/api/v1/',
  '56': 'https://safe-transaction.bsc.gnosis.io/api/v1/',
  '42161': 'https://safe-transaction.arbitrum.gnosis.io/api/v1/'
};

export const EIP3770_PREFIXES = {
  '1': 'eth',
  '4': 'rin',
  '5': 'gor',
  '56': 'bnb',
  '100': 'gno',
  '246': 'ewt',
  '73799': 'vt',
  '42161': 'arb1',
  '137': 'matic'
};

export const EIP712_SAFE_TRANSACTIN_TYPES = {
  Transaction: [
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'data', type: 'bytes' },
    { name: 'operation', type: 'uint8' },
    { name: 'nonce', type: 'uint256' }
  ]
};

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

export enum SafeType {
  GNOSIS = 'gnosis',
  TRIBUTE = 'tribute'
}

export interface Safe {
  name: string;
  type: SafeType;
  address: string;
  network: string;
}

export enum SafeModuleType {
  REALITY = 'reality',
  UMA = 'uma',
  TELLOR = 'tellor'
}

export interface SafeModule {
  address: string;
  type: SafeModuleType;
}

export const SafeModuleLogos = {
  [SafeModuleType.REALITY]:
    'https://realityeth.github.io/da16ed6ca9d09bddfa60.png',
  [SafeModuleType.UMA]:
    'https://oracle.umaproject.org/static/media/uma-oo-logo-top.b60aad67dfef47096afe84a291b1c853.svg',
  [SafeModuleType.TELLOR]:
    'https://s2.coinmarketcap.com/static/img/coins/64x64/4944.png'
};

export interface SafeConfig {
  safe: Safe;
  modules: SafeModule[];
}

export enum TransactionOperationType {
  CALL,
  DELEGATECALL
}

export type Transaction = {
  to: string;
  value: BigNumber;
  data: string;
  operation: TransactionOperationType;
};

export type MultisendTransaction = Transaction & {
  operation: TransactionOperationType.DELEGATECALL;
};

export type ExecutionDataABIs = {
  [contractAddress: string]: string;
};

export interface ExecutionData {
  safe: Safe;
  batches: Transaction[][];
  abis?: ExecutionDataABIs;
  module?: SafeModule;
  multisendAddress?: string;
  criteria?: string; // for human or automated (can be JSON) processing in (optimistic) oracles
  // TODO: add text field in transaction builder for this
}

export interface ModuleExecutionData extends ExecutionData {
  module: SafeModule;
}

export interface Executor<ExecutionState> {
  loading: Ref<boolean>;
  state: ComputedRef<ExecutionState>;
  propose(...key: any[]): Promise<void>;
  dispute(...key: any[]): Promise<void>;
  execute(...key: any[]): Promise<void>;
  [key: string]: any;
}

export interface Asset {
  name: string;
  symbol: string;
}

export interface FundsAsset extends Asset {
  decimals: number;
  safeBalance: BigNumber;
  logoUri: string;
  tokenAddress?: string; // native asset has no token address
}

export interface CollectableAsset extends Asset {
  tokenAddress: string;
  id: BigNumber;
  imageUri: string;
}

export type NativeCoinInfo = {
  name: string;
  symbol: string;
  decimals: number;
  logoUri: string;
};

const ETHEREUM_COIN: NativeCoinInfo = {
  name: 'Ether',
  decimals: 18,
  symbol: 'ETH',
  logoUri:
    'https://safe-transaction-assets.gnosis-safe.io/chains/1/currency_logo.png'
};

const MATIC_COIN: NativeCoinInfo = {
  name: 'MATIC',
  decimals: 18,
  symbol: 'MATIC',
  logoUri:
    'https://safe-transaction-assets.gnosis-safe.io/chains/137/currency_logo.png'
};

const EWC_COIN: NativeCoinInfo = {
  name: 'Energy Web Token',
  symbol: 'EWT',
  decimals: 18,
  logoUri:
    'https://safe-transaction-assets.gnosis-safe.io/chains/246/currency_logo.png'
};

const XDAI_COIN: NativeCoinInfo = {
  name: 'XDAI',
  symbol: 'XDAI',
  decimals: 18,
  logoUri:
    'https://safe-transaction-assets.gnosis-safe.io/chains/100/currency_logo.png'
};

const BNB_COIN: NativeCoinInfo = {
  name: 'BNB',
  symbol: 'BNB',
  decimals: 18,
  logoUri:
    'https://safe-transaction-assets.gnosis-safe.io/chains/56/currency_logo.png'
};

export function getNativeCoinInfo(network: string): NativeCoinInfo {
  switch (parseInt(network)) {
    case 137:
    case 80001:
      return MATIC_COIN;
    case 100:
      return XDAI_COIN;
    case 246:
      return EWC_COIN;
    case 56:
      return BNB_COIN;
  }

  return ETHEREUM_COIN;
}

async function callSafeTransactionApi(network: string, url: string) {
  const apiUrl = SAFE_TRANSACTION_API_URLS[network];
  const response = await fetch(apiUrl + url);
  return response.json();
}

export const getSafeFunds = async (
  network: string,
  safeAddress: string
): Promise<FundsAsset[]> => {
  const endpointPath = `/safes/${safeAddress}/balances/`;
  const balances = await callSafeTransactionApi(network, endpointPath);

  return balances.map(({ balance, tokenAddress, token }) => {
    if (tokenAddress === null) {
      return {
        ...getNativeCoinInfo(network),
        safeBalance: balance
      };
    }
    return {
      safeBalance: balance,
      ...token,
      tokenAddress
    };
  });
};

export const getSafeCollectables = async (
  network: string,
  safeAddress: string
): Promise<CollectableAsset[]> => {
  const endpointPath = `/safes/${safeAddress}/collectibles/`;
  const collectables = await callSafeTransactionApi(network, endpointPath);

  return collectables.map(collectable => ({
    name: collectable.tokenName,
    symbol: collectable.tokenSymbol,
    tokenAddress: collectable.address,
    id: collectable.id,
    imageUri: collectable.imageUri
  }));
};

export const getSafeToken = async (
  network: string,
  tokenAddress: string
): Promise<FundsAsset> => {
  const endpointPath = `/tokens/${tokenAddress}`;
  return callSafeTransactionApi(network, endpointPath);
};

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

export function convertExecutionDataToModuleTransactions(
  executionData: ExecutionData
): Transaction[] {
  return executionData.batches
    .map(batch => {
      if (!batch.length) return null;

      if (batch.length === 1) {
        return batch[0];
      } else {
        return convertBatchToMultisendTransaction(
          batch,
          executionData.multisendAddress ||
            MULTI_SEND_CONTRACT_ADDRESSES_V1_3_0[
              `CHAIN_${executionData.safe.network}`
            ]
        );
      }
    })
    .filter(tx => tx !== null) as Transaction[];
}

export function convertBatchToMultisendTransaction(
  batch: Transaction[],
  multisendAddress: string
): MultisendTransaction {
  const multiSendContract = new Interface(MULTISEND_ABI);
  const transactionsEncoded = encodeTransactionsForMultisend(batch);
  const data = multiSendContract.encodeFunctionData('multiSend', [
    transactionsEncoded
  ]);
  return {
    to: multisendAddress,
    operation: TransactionOperationType.DELEGATECALL,
    value: BigNumber.from(0),
    data
  };
}
