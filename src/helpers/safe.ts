import { BigNumber } from '@ethersproject/bignumber';
import { Transaction } from './transactionBuilder';

const SAFE_TRANSACTION_API_URLS = {
  '1': 'https://safe-transaction.gnosis.io/api/v1/',
  '4': 'https://safe-transaction.rinkeby.gnosis.io/api/v1/',
  '100': 'https://safe-transaction.xdai.gnosis.io/api/v1/',
  '73799': 'https://safe-transaction.volta.gnosis.io/api/v1/',
  '246': 'https://safe-transaction.ewc.gnosis.io/api/v1/',
  '137': 'https://safe-transaction.polygon.gnosis.io/api/v1/',
  '56': 'https://safe-transaction.bsc.gnosis.io/api/v1/',
  '42161': 'https://safe-transaction.arbitrum.gnosis.io/api/v1/'
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

export interface ExecutionData {
  safe: Safe;
  batches: Transaction[][];
  module?: SafeModule;
  choice?: number;
}

export interface ModuleExecutionData extends ExecutionData {
  module: SafeModule;
}

// These interfaces could turn out to be more limiting than helpful. We'll see.
export interface ExecutorState {
  loading: boolean;
  hasBeenProposed: boolean;
  canBeExecuted: boolean;
  hasBeenExecuted: boolean;
  hasBeenRejected: boolean;
  [x: string]: any;
}

export interface Executor<TState = ExecutorState> {
  state: TState;
  setState(...key: any[]): Promise<void>;
  proposeExecution(...key: any[]): AsyncGenerator;
  disputeExecution(...key: any[]): AsyncGenerator;
  execute(...key: any[]): AsyncGenerator;
  [x: string]: any; // Would like to remove this and not allow extra stuff.
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

export interface TransactionBuilderInitData {
  title: string;
  batches: Transaction[][];
  getAvailableFunds?(): Promise<FundsAsset[]>;
  getAvailableCollectables?(): Promise<CollectableAsset[]>;
  safe: Safe;
  module?: SafeModule;
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
