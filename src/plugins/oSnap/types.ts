import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { safePrefixes, transactionTypes } from './constants';

/**
 * Represents details about the chains that snapshot supports as described in the `networks` json file. 
 * 
 * This corresponds to one of the chain ids that snapshot supports.
 * 
 * @see `@snapshot-labs/snapshot.js/src/networks.json`.
 */
type Networks = typeof networks;


/**
 * One of the supported networks as defined in `@snapshot-labs/snapshot.js/src/networks.json`.
 * @see Networks
 */
export type Network = keyof Networks;

/**
 * The supported network prefixes as defined in EIP-3770 used by Safe apps.
 * @see https://eips.ethereum.org/EIPS/eip-3770
 */
export type SafeNetworkPrefixes = typeof safePrefixes;

/** 
 * One of the supported network prefixes as defined in EIP-3770 used by Safe apps.
 * @see SafeNetworkPrefixes
 */
export type SafeNetworkPrefix = SafeNetworkPrefixes[Network];

/**
 * Represents the four different types of transactions that oSnap supports.
 * 
 * - Transfer Funds
 * - Transfer NFT (also called Collectable)
 * - Contract Interaction
 * - Raw
 */
export type TransactionTypes = typeof transactionTypes;

/**
 * One of the four different types of transactions that oSnap supports.
 * 
 * - Transfer Funds
 * - Transfer NFT (also called Collectable)
 * - Contract Interaction
 * - Raw
 */
export type TransactionType = TransactionTypes[number];

/**
 * The Optimistic Governor contract requires transactions that it executes to be formatted like this.
 * 
 * This corresponds to the values found in the `Transaction` struct in the Optimistic Governor contract.
 * 
 * @see https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/optimistic-governor/implementation/OptimisticGovernor.sol
 * 
 * NOTE: Since we don't support the contract's `delegatecall` feature in oSnap, the value for `operation` is always 0.
 */
export type OptimisticGovernorTransaction = [to: string, operation: 0, value: string, data: string];

/**
 * Represents the data associated with the different types of transactions that oSnap supports.
 * 
 * This is a discriminated union of the four object types that represent the data associated with a given transaction. The union discriminates on the `type` property of the objects. 
 * 
 * @see TransactionTypes
 */
export type Transaction = RawTransaction | ContractInteractionTransaction | TransferNftTransaction | TransferFundsTransaction;

/**
 * Represents the fields that all transactions share.
 * 
 * All the transaction types inherit from this type, adding their `type` field and any additional fields that they require.
 * 
 * NOTE: the `formatted` field is what is actually sent to the Optimistic Governor contract.
 */
export type BaseTransaction = {
  to: string;
  value: string;
  data: string;
  formatted: OptimisticGovernorTransaction;
}

/**
 * Represents a 'raw' transaction that does not have any additional fields.
 */
export type RawTransaction = BaseTransaction & {
  type: 'raw';
}

/**
 * Represents a transaction that interacts with an arbitrary contract.
 * 
 * @field `abi` field is the ABI of the contract that the transaction interacts with, represented as a JSON string.
 * 
 * @field `methodName` field is the name of the method on the contract that the transaction calls.
 * 
 * @field `parameters` field is an array of strings that represent the parameters that the method takes. NOTE: some methods take arrays or tuples as arguments, so some of these strings in the array may be JSON formatted arrays or tuples.
 */
export type ContractInteractionTransaction = BaseTransaction & {
  type: 'contractInteraction';
  abi?: string;
  methodName?: string;
  parameters?: string[];
}

/**
 * Represents a transaction that transfers an NFT (also called a Collectable).
 * 
 * @field `recipient` field is the address of the recipient of the NFT.
 * 
 * @field `collectable` field is the NFT that is being transferred.
 */
export type TransferNftTransaction = BaseTransaction & {
  type: 'transferNFT';
  recipient?: string;
  collectable?: NFT;
}

/**
 * Represents a transaction that transfers funds.
 * 
 * @field `amount` field is the amount of funds that are being transferred.
 * 
 * @field `recipient` field is the address of the recipient of the funds.
 * 
 * @field `token` field is the token that is being transferred.
 */
export type TransferFundsTransaction = BaseTransaction & {
  type: 'transferFunds';
  amount?: string;
  recipient?: string;
  token?: Token;
}

/**
 * The base type for assets that can be transferred by a transaction.
 * 
 * Can represent either an NFT or an ERC20 token.
 * 
 * @field `name` field is the name of the asset.
 * @field `address` field is the address of the asset.
 * @field `logoUri` field is the URI of the logo of the asset, if one exists.
 * @field `imageUri` field is the URI of the image of the asset, if one exists.
 * 
 * @see https://miyauchi.dev/posts/typescript-literal-hack/ for details about the `(string & {})` syntax.
 */
export type Asset = {
  name: string;
  address: "main" | (string & {});
  logoUri?: string;
  imageUri?: string;
}

/**
 * Represents an ERC20 token.
 * 
 * @field `symbol` field is the symbol of the token.
 * @field `decimals` field is the number of decimals that the token has.
 * @field `balance` field is the balance of the token that the user has.
 * @field `verified` field is whether or not the token is verified by Gnosis or Snapshot contract.
 * @field `chainId` field is the chain id of the network that the token is on.
 */
export type Token = Asset & {
  symbol: string;
  decimals: number;
  balance?: string;
  verified?: boolean;
  chainId?: Network;
}

/**
 * Represents an ERC-721 NFT (also called a Collectable).
 * 
 * @field `id` field is the id of the NFT, usually used as the mint number.
 * @field `tokenName` field is the name of the NFT.
 */
export type NFT = Asset & {
  id: string;
  tokenName?: string;
}

/**
 * Represents the response from the Gnosis Safe API when fetching the balances of the tokens that the user has. This is immediately transformed after fetching into the `Token` type, which holds both the token and the balance.
 * 
 * @field `tokenAddress` field is the address of the token.
 * @field `token` field is the token that the safe has.
 * @field `balance` field is the balance of the token that the user has.
 */
export type BalanceResponse = {
  tokenAddress: string;
  token: {
    decimals: number;
    logoUri: string;
    name: string;
    symbol: string;
  };
  balance: string;
}

/**
 * Represents the data associated with a safe.
 * 
 * The plugin persists one object with this shape per proposal created. This object holds the `transactions` that the Optimistic Governor contract will execute.
 * 
 * @field `safeName` field is the name of the safe.
 * @field `safeAddress` field is the address of the safe.
 * @field `network` field is the id for network that the safe is on.
 * @field `moduleAddress` field is the address of the Optimistic Governor contract that was deployed for this safe.
 * @field `transactions` field is the list of transactions that the Optimistic Governor contract will execute.
 */
export type GnosisSafe = {
  safeName: string;
  safeAddress: string;
  network: Network;
  moduleAddress: string;
  transactions: Transaction[];
}

/**
 * Represents the data associated with the plugin.
 * 
 * Holds one object with this shape per proposal created. This is the shape of the data that is persisted by the plugin.
 * 
 * `safe` is null when first creating a plugin, but is then immediately populated once the user picks a safe.
 * 
 * @field `safe` field is the safe that the plugin is currently working with.
 */
export type OsnapPluginData = {
    safe: GnosisSafe | null;
}

/**
 * Snapshot has a global store that holds all the data for all the plugins. 
 * 
 * This is the shape of the data that the plugin stores in the global store.
 */
export type OsnapModelValue = {
  oSnap: OsnapPluginData;
}