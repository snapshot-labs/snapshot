import { TreasuryWallet } from '@/helpers/interfaces';
import { defaultAbiCoder } from '@ethersproject/abi';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract, Event, EventFilter } from '@ethersproject/contracts';
import { keccak256 } from '@ethersproject/keccak256';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { pack } from '@ethersproject/solidity';
import { toUtf8Bytes } from '@ethersproject/strings';
import { multicall } from '@snapshot-labs/snapshot.js/src/utils';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import memoize from 'lodash/memoize';
import {
  ERC20_ABI,
  GNOSIS_SAFE_TRANSACTION_API_URLS,
  OPTIMISTIC_GOVERNOR_ABI,
  OPTIMISTIC_ORACLE_V3_ABI,
  contractData,
  safePrefixes,
  solidityZeroHexString
} from '../constants';
import { AssertionGql, AssertionMadeEvent, BalanceResponse, CollateralDetails, NFT, Network, OGModuleDetails, OGProposalState, OptimisticGovernorTransaction, ProposalExecutedEvent, SafeNetworkPrefix, TransactionsProposedEvent } from '../types';
import { pageEvents } from './events';

/**
 * Calls the Gnosis Safe Transaction API
 * 
 * Ideal usage is to specify the shape of the response with the generic type parameter, assuming that the shape of the response is known.
 */
async function callGnosisSafeTransactionApi<TResult = any>(
  network: Network,
  url: string
) {
  const apiUrl = GNOSIS_SAFE_TRANSACTION_API_URLS[network];
  const response = await fetch(apiUrl + url);
  return response.json() as TResult;
}

/**
 * Fetches the balances of the tokens owned by a given Safe.
 */
export const getGnosisSafeBalances = memoize(
  (network: Network, safeAddress: string) => {
    const endpointPath = `/v1/safes/${safeAddress}/balances/`;
    return callGnosisSafeTransactionApi<Partial<BalanceResponse>[]>(network, endpointPath);
  },
  (safeAddress, network) => `${safeAddress}_${network}`
);

/**
 * Fetches the collectibles owned by a given Safe.
 */
export const getGnosisSafeCollectibles = memoize(
  (network: Network, safeAddress: string) => {
    const endpointPath = `/v2/safes/${safeAddress}/collectibles/`;
    // the endpoint returns the data in this form, most likely to allow you to page the data.
    type Result = {
      count: number;
      next: unknown;
      previous: unknown;
      results: NFT[];
    }
    return callGnosisSafeTransactionApi<Result>(network, endpointPath);
  },
  (safeAddress, network) => `${safeAddress}_${network}`
);

/**
 * Fetches the block number of a given contract's deployment.
 */
function getDeployBlock(params: {
  network: Network,
  name: string,
}): number {
  const results = contractData.filter(contract => contract.network === params.network && contract.name === params.name)
  if (results.length === 1) return results[0].deployBlock ?? 0;
  return 0;
}

/**
 * Fetches the subgraph url for a given contract on a given network.
 */
function getContractSubgraph(params: {
  network: Network;
  name: string;
}) {
  const results = contractData.filter(contract => contract.network === params.network && contract.name === params.name)
  if (results.length > 1)
    throw new Error(
      `Too many results finding ${params.name} subgraph on network ${params.network}`
    );
  if (results.length < 1)
    throw new Error(
      `No results finding ${params.name} subgraph on network ${params.network}`
    );
  if (!results[0].subgraph)
    throw new Error(
      `No subgraph url defined for ${params.name} on network ${params.network}`
    );
  return results[0].subgraph;
}

/**
 * A helper that wraps the getContractSubgraph function to return the subgraph url for the OptimisticGovernor contract on a given network.
 */
function getOptimisticGovernorSubgraph(network: Network): string {
  return getContractSubgraph({ network, name: 'OptimisticGovernor' });
}

/**
 * A helper that wraps the getContractSubgraph function to return the subgraph url for the OptimisticOracleV3 contract on a given network.
 */
function getOracleV3Subgraph(network: Network): string {
  return getContractSubgraph({ network, name: 'OptimisticOracleV3' });
}

/**
 * Executes a graphql query.
 * 
 * Ideal usage is to specify the shape of the response with the generic type parameter, assuming that the shape of the response is known.
 */
export const queryGql = async <Result = any>(url: string, query: string) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({ query: query })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Network Error: ${response.status}, message: ${errorData.message}`
      );
    }
    const data = await response.json();
    // Throw an error if there are errors in the GraphQL response
    if (data.errors) {
      throw new Error(
        `GraphQL Error: ${data.errors.map(error => error.message).join(', ')}`
      );
    }
    return data.data as Result;
  } catch (error) {
    throw new Error(`Network error: ${error instanceof Error ? error.message: error}`);
  }
};

/**
 * Returns the address of the Optimistic Governor contract deployment associated with a given treasury (Safe) from the graph.
 */
export const getModuleAddressForTreasury = async (network: Network, treasuryAddress: string) => {
  const subgraph = getOptimisticGovernorSubgraph(network);
  const query = `
  query getModuleAddressForTreasury {
      safe(id: "${treasuryAddress.toLowerCase()}") {
        optimisticGovernor {
          id
        }
      }
  }
  `

  type Result = {
    safe: { optimisticGovernor: { id: string } };
  }

  const result = await queryGql<Result>(subgraph, query);
  return result?.safe?.optimisticGovernor?.id ?? '';
}

/**
 * Checks if a given treasury (Safe) has enabled oSnap.
 */
export const getIsOsnapEnabled = async (
  network: Network,
  safeAddress: string
) => {
  const subgraph = getOptimisticGovernorSubgraph(network);
  const query = `
      query isOSnapEnabled {
        safe(id:"${safeAddress.toLowerCase()}"){
          isOptimisticGovernorEnabled
        }
      }
    `;
  type Result = {
    safe: { isOptimisticGovernorEnabled: boolean };
  };
  const result = await queryGql<Result>(subgraph, query);
  return result?.safe?.isOptimisticGovernorEnabled ?? false;
};

/**
 * Takes an array of treasuries and checks if any of them have oSnap enabled.
 */
export const getSpaceHasOsnapEnabledTreasury = async (treasuries: TreasuryWallet[]) => {
  const isOsnapEnabledOnTreasuriesResult = await Promise.all(treasuries.map(treasury => getIsOsnapEnabled(treasury.network as Network, treasury.address)))
  return isOsnapEnabledOnTreasuriesResult.some(isOsnapEnabled => isOsnapEnabled);
}

/**
 * Creates the url for the Safe app to configure oSnap.
 * 
 * The data that the Safe app needs is encoded as URL search params.
 */
export function makeConfigureOsnapUrl(params: {
  safeAddress: string;
  network: Network;
  spaceName: string;
  spaceUrl: string;
  baseUrl?: string;
  appUrl?: string;
}) {
  const {
    safeAddress,
    network,
    spaceName,
    spaceUrl,
    baseUrl = 'https://app.safe.global/apps/open',
    appUrl = 'https://osnap.uma.xyz/'
  } = params;
  const safeAddressPrefix = getSafeNetworkPrefix(network);
  const appUrlSearchParams = new URLSearchParams();
  appUrlSearchParams.set('spaceName', spaceName);
  appUrlSearchParams.set('spaceUrl', spaceUrl);
  const appUrlSearch = appUrlSearchParams.toString();
  const safeAppSearchParams = new URLSearchParams();
  safeAppSearchParams.set('safe', `${safeAddressPrefix}:${safeAddress}`);
  safeAppSearchParams.set('appUrl', `${appUrl}?${appUrlSearch}`);
  const safeAppSearch = safeAppSearchParams.toString();
  const url = `${baseUrl}?${safeAppSearch}`;
  return url;
}

/**
 * Fetches the details of a given assertion from the Optimistic Oracle V3 subgraph.
 */
async function getAssertionGql(params: { network: Network, assertionId: string; }) {
  const { assertionId, network } = params;
  const oracleUrl = getOracleV3Subgraph(network);
  const request = `
  {
    assertion(id:"${assertionId}"){
      assertionId
      expirationTime
      assertionHash
      disputeHash
      settlementHash
      assertionLogIndex
      settlementResolution
    }
  }
  `;
  type Result = {
    assertion: AssertionGql | undefined;
  }
  const result = await queryGql<Result>(oracleUrl, request);
  return result?.assertion;
}
/**
 * Fetches the details of a given proposal from the Optimistic Governor subgraph.
 */
async function getOgProposalGql(params: { network: Network, explanation: string; moduleAddress: string; transactions: OptimisticGovernorTransaction[] }) {
  const { network, transactions, explanation, moduleAddress } = params;
  const proposalHash = getProposalHashFromTransactions(transactions);
  const encodedExplanation = pack(
    ['bytes'],
    [toUtf8Bytes(explanation.replace(/^0x/, ''))]
  );
const subgraph = getOptimisticGovernorSubgraph(network);
const request = `
{
  proposals(where:{proposalHash:"${proposalHash}",explanation:"${encodedExplanation}",optimisticGovernor:"${moduleAddress.toLowerCase()}"}){
    id
    executed
    deleted
    assertionId
  }
}
`;
type Result = {
  proposals: { id: string; executed: boolean; assertionId: string; deleted: boolean }[];
}
const result = await queryGql<Result>(subgraph, request);
// we can only use the gql `where` clause when querying a list, but we know that there will only be one result.
return result?.proposals[0];
}

export async function getCollateralDetailsForProposal(provider: StaticJsonRpcProvider, moduleAddress: string): Promise<CollateralDetails> {
  const moduleContract = new Contract(moduleAddress, OPTIMISTIC_GOVERNOR_ABI, provider);

  const erc20Contract = new Contract(
    await moduleContract.collateral(),
    ERC20_ABI,
    provider
  );

  const address = erc20Contract.address;
  const symbol: string = await erc20Contract.symbol();
  const decimals: BigNumber = await erc20Contract.decimals();

  return { erc20Contract, address, symbol, decimals };
}

export async function getUserCollateralAllowance(erc20Contract: Contract, userAddress: string, moduleAddress: string) {
  return erc20Contract.allowance(userAddress, moduleAddress);
}

export async function getUserCollateralBalance(erc20Contract: Contract, userAddress: string) {
  return erc20Contract.balanceOf(userAddress);
}

export async function getOGModuleDetails(params: {
  provider: StaticJsonRpcProvider;
  network: Network;
  moduleAddress: string;
  transactions: OptimisticGovernorTransaction[];
}): Promise<OGModuleDetails> {
  const { provider, network, moduleAddress } = params;
  const moduleDetails: [
    [oracleAddress: string],
    [rules: string],
    [minimumBond: BigNumber],
    [challengePeriod: BigNumber]
  ] = await multicall(network, provider, OPTIMISTIC_GOVERNOR_ABI as any, [
    [moduleAddress, 'optimisticOracleV3'],
    [moduleAddress, 'rules'],
    [moduleAddress, 'bondAmount'],
    [moduleAddress, 'liveness']
  ]);

  const oracleAddress = moduleDetails[0][0];
  const rules = moduleDetails[1][0];
  const minimumBond = moduleDetails[2][0];
  const challengePeriod = moduleDetails[3][0];

  return {
    moduleAddress,
    oracleAddress,
    rules,
    minimumBond,
    challengePeriod,
  };
}

async function getPagedEvents<EventType = Event>(params: {
  contract: Contract;
  eventFilter: EventFilter;
  startBlock: number;
  latestBlock: number;
  maxRange: number;
}) {
  const { contract, eventFilter, startBlock, latestBlock, maxRange } = params;
  const eventPager = ({ start, end }: { start: number; end: number; }) => {
    return contract.queryFilter(
      eventFilter,
      start,
      end
    );
  }
  const pagedEvents = await pageEvents(
    startBlock,
    latestBlock,
    maxRange,
    eventPager,
  );
  return pagedEvents as (Event & EventType)[];
}


export async function getOgProposalStateFromChain(params: {
  moduleDetails: OGModuleDetails,
  network: Network,
  explanation: string;
  transactions: OptimisticGovernorTransaction[]
}): Promise<OGProposalState> {
  const { network, moduleDetails, explanation, transactions } = params;
  const provider = getProvider(network);
  const latestBlock = (await provider.getBlock('latest')).number;
  // modify this per chain. this should be updated with constants for all chains. start block is og deploy block.
  // this needs to be optimized to reduce loading time, currently takes a long time to parse 3k blocks at a time.
  const oGstartBlock = getDeployBlock({ network, name: 'OptimisticGovernor' });
  const oOStartBlock = getDeployBlock({ network, name: 'OptimisticOracleV3' });
  const maxRange = 3000;
  const { moduleAddress, oracleAddress, rules } = moduleDetails;
  const moduleContract = new Contract(moduleAddress, OPTIMISTIC_GOVERNOR_ABI, provider);
  const oracleContract = new Contract(
    oracleAddress,
    OPTIMISTIC_ORACLE_V3_ABI,
    provider
  );
  const proposalHash = getProposalHashFromTransactions(transactions);
  const claimHash = getClaimHash({
    proposalHash,
    explanation,
    rules
  });

  const assertionId: string = await moduleContract.assertionIds(proposalHash);

  const hasAssertionId = assertionIdIsNotZero(assertionId);

  if (hasAssertionId) {
    const assertionMadeEventForCurrentAssertionIdFilter = oracleContract.filters.AssertionMade(assertionId)

    const assertionMadeEvents = await getPagedEvents<AssertionMadeEvent>({
      contract: oracleContract,
      eventFilter: assertionMadeEventForCurrentAssertionIdFilter,
      startBlock: oOStartBlock,
      latestBlock,
      maxRange
    });

    // assertion ids are unique, so this will have only one result
    const assertionMadeEvent = assertionMadeEvents[0];

    const expirationTime = assertionMadeEvent.args?.expirationTime.toNumber();
    const isInChallengePeriod = (expirationTime * 1000) > Date.now();
    const assertionHash = assertionMadeEvent.transactionHash;
    const assertionLogIndex = assertionMadeEvent.logIndex.toString();

    if (isInChallengePeriod) {
      return { status: 'in-oo-challenge-period', assertionHash, assertionLogIndex, expirationTime};
    }

    return {
      status: 'can-request-tx-execution',
      assertionHash,
      assertionLogIndex,
    }
  }

  const transactionsProposedEventFilter = moduleContract.filters.TransactionsProposed();

  const transactionsProposedEvents = await getPagedEvents<TransactionsProposedEvent>({
    contract: moduleContract,
    eventFilter: transactionsProposedEventFilter,
    startBlock: oGstartBlock,
    latestBlock,
    maxRange
  });

  const transactionsProposedEventsThatMatch = transactionsProposedEvents.filter(event => event.args?.proposalHash === proposalHash && event.args?.explanation === explanation);

  const hasTransactionProposedEvents = transactionsProposedEventsThatMatch.length > 0;

  // we can return early and skip querying for execution events if there are no proposal events
  if (!hasTransactionProposedEvents) {
    return {
      status: 'can-propose-to-og',
      isDisputed: false,
    }
  }

    // the proposal hash is not indexed on the transactions proposed event unfortunately, but it is on the proposal executed event.
  // so at least we can use it for this one to narrow down the results.
  const proposalExecutedEventFilter = moduleContract.filters.ProposalExecuted(proposalHash);

  const proposalExecutedEvents = await getPagedEvents<ProposalExecutedEvent>({
    contract: moduleContract,
    eventFilter: proposalExecutedEventFilter,
    startBlock: oGstartBlock,
    latestBlock,
    maxRange
  });

  // we know that the transactions have been executed if there is an execution event with an assertion id that matches an assertion id for a proposal event
  let proposalExecuted = false;
  for (const proposalExecutedEvent of proposalExecutedEvents) {
    for (const transactionsProposedEvent of transactionsProposedEventsThatMatch) {
      if (proposalExecutedEvent.args?.assertionId === transactionsProposedEvent.args?.assertionId) {
        proposalExecuted = true;
        break;
      }
    }
  }

  if (proposalExecuted) {
    const assertionMadeEventForExecutedAssertionIdFilter = oracleContract.filters.AssertionMade(assertionId)

    const assertionMadeEvents = await getPagedEvents<AssertionMadeEvent>({
      contract: oracleContract,
      eventFilter: assertionMadeEventForExecutedAssertionIdFilter,
      startBlock: oOStartBlock,
      latestBlock,
      maxRange
    });

    // assertion ids are unique, so this will have only one result
    const assertionMadeEvent = assertionMadeEvents[0];


    return { status: 'transactions-executed', assertionHash: assertionMadeEvent.transactionHash, assertionLogIndex: assertionMadeEvent.logIndex.toString() };
  }

  return {
    status: 'can-propose-to-og',
    isDisputed: false,
  }
}

export async function getOGProposalStateGql(params: {
  network: Network;
  moduleAddress: string;
  proposalHash: string;
  explanation: string;
  transactions: OptimisticGovernorTransaction[];
}): Promise<OGProposalState> {
  const { network } = params;
  const oGproposal = await getOgProposalGql(params);
  
  if (!oGproposal) {
    return { status: 'can-propose-to-og', isDisputed: false };
  }

  const { executed, assertionId, deleted } = oGproposal;
  
  if (deleted) {
    return { status: 'can-propose-to-og', isDisputed: true };
  }

  const hasAssertionId = assertionIdIsNotZero(assertionId);

  if (!hasAssertionId) {
    return { status: 'can-propose-to-og', isDisputed: false };
  }

  const assertion = await getAssertionGql({ network, assertionId })

  if (!assertion) {
    return { status: 'can-propose-to-og', isDisputed: false };
  }

  const { assertionHash, settlementHash, assertionLogIndex, settlementResolution } = assertion;

  // if the assertion is settled and the graph says the transactions have been executed, then we know the assertion passed and we can return early
  if (executed && settlementHash) {
    return {
      status: 'transactions-executed',
      assertionHash,
      assertionLogIndex,
    }
  }

  // if the settlement hash exists and the settlement resolution is true, then we know that the assertion passed.
  // we already checked if the transactions were executed, so we know that the assertion passed but the transactions were not executed yet.
  if (settlementHash && settlementResolution) {
    return {
      status: 'can-request-tx-execution',
      assertionHash,
      assertionLogIndex,
    }
  }

  const expirationTime = Number(assertion.expirationTime);
  const isExpired = Math.floor(Date.now() / 1000) >= expirationTime

  // from the above checks, we know that the transactions have not been executed, the assertion has not been disputed, and the assertion has not been settled.
  // if the assertion challenge period has not yet expired, then we know we are still in the challenge period.
  if (!isExpired) {
    return {
      status: 'in-oo-challenge-period',
      assertionHash,
      assertionLogIndex,
      expirationTime,
    }
  }

  // if all the above fails, fall back to the no assertion state
  // this should not be possible though
  return { status: 'can-propose-to-og', isDisputed: false };
}

function assertionIdIsNotZero(assertionId: string) {
  return assertionId !== solidityZeroHexString;
}

export async function getOGProposalState(params: {
  moduleDetails: OGModuleDetails,
  network: Network,
  explanation: string;
  transactions: OptimisticGovernorTransaction[]
}): Promise<OGProposalState> {
  const { network, moduleDetails, explanation, transactions } = params;
  const { moduleAddress } = moduleDetails;
  const proposalHash = getProposalHashFromTransactions(transactions);
  try {
    return await getOGProposalStateGql({
      network,
  moduleAddress,
  proposalHash,
  explanation,
  transactions
    });
  } catch (error) {
    console.warn('Error fetching OG proposal state from subgraph, falling back to chain', error);
    return getOgProposalStateFromChain({
      network,
      moduleDetails,
      explanation,
      transactions
    })
  }
}

export function getProposalHashFromTransactions(transactions: OptimisticGovernorTransaction[]) {
  return keccak256(
    defaultAbiCoder.encode(
      ['(address to, uint8 operation, uint256 value, bytes data)[]'],
      [transactions]
    )
  );
}

export function getClaimHash(params: {
  proposalHash: string;
  explanation: string;
  rules: string;
}) {
  const { proposalHash, explanation, rules } = params;

  return pack(
    ['string', 'bytes', 'bytes', 'bytes', 'bytes', 'bytes', 'bytes', 'bytes'],
    [
      '',
      pack(['string', 'string'], ['proposalHash', ':']),
      toUtf8Bytes(proposalHash.replace(/^0x/, '')),
      pack(
        ['string', 'string', 'string', 'string'],
        [',', 'explanation', ':', '"']
      ),
      toUtf8Bytes(explanation.replace(/^0x/, '')),
      pack(
        ['string', 'string', 'string', 'string', 'string'],
        ['"', ',', 'rules', ':', '"']
      ),
      toUtf8Bytes(rules.replace(/^0x/, '')),
      pack(['string'], ['"'])
    ]
  );
}

/**
 * Returns the EIP-3770 prefix for a given network.
 * 
 * @see SafeNetworkPrefix
 */
export function getSafeNetworkPrefix(network: Network): SafeNetworkPrefix {
  return safePrefixes[network];
}

/**
 * Returns the url for a given Safe app on a given network.
 */
export function getSafeAppLink(network: Network, safeAddress: string, appUrl = "https://gnosis-safe.io/app/") {
  const prefix = getSafeNetworkPrefix(network);
  return `${appUrl}${prefix}:${safeAddress}`;
}

export function getOracleUiLink(chain: string, txHash: string, logIndex: number) {
  if (Number(chain) !== 5 && Number(chain) !== 80001) {
    return `https://oracle.uma.xyz?transactionHash=${txHash}&eventIndex=${logIndex}`;
  }
  return `https://testnet.oracle.uma.xyz?transactionHash=${txHash}&eventIndex=${logIndex}`;
}