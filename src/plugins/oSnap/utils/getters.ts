import { TreasuryWallet } from '@/helpers/interfaces';
import { defaultAbiCoder } from '@ethersproject/abi';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract, Event, EventFilter } from '@ethersproject/contracts';
import { keccak256 } from '@ethersproject/keccak256';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { pack } from '@ethersproject/solidity';
import { toUtf8Bytes, toUtf8String } from '@ethersproject/strings';
import { multicall } from '@snapshot-labs/snapshot.js/src/utils';
import memoize from 'lodash/memoize';
import {
  ERC20_ABI,
  GNOSIS_SAFE_TRANSACTION_API_URLS,
  OPTIMISTIC_GOVERNOR_ABI,
  OPTIMISTIC_ORACLE_V3_ABI,
  contractData,
  safePrefixes
} from '../constants';
import { Assertion, AssertionEvent, AssertionGql, AssertionMadeEvent, BalanceResponse, CollateralDetails, NFT, Network, OGModuleDetails, OGProposalState, OptimisticGovernorTransaction, ProposalDetails, ProposalExecutedEvent, SafeNetworkPrefix, TransactionsProposedEvent } from '../types';
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
async function findAssertionGql(params: { network: Network, assertionId: string; }) {
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
async function findProposalGql(params: {network: Network, transactions: OptimisticGovernorTransaction[]; explanation: string; moduleAddress: string; }) {
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
      assertionId
    }
  }
  `;
  type Result = {
    proposals: { id: string; executed: boolean; assertionId: string }[];
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
    [safeAddress: string],
    [oracleAddress: string],
    [rules: string],
    [minimumBond: BigNumber],
    [challengePeriod: BigNumber]
  ] = await multicall(network, provider, OPTIMISTIC_GOVERNOR_ABI as any, [
    [moduleAddress, 'avatar'],
    [moduleAddress, 'optimisticOracleV3'],
    [moduleAddress, 'rules'],
    [moduleAddress, 'bondAmount'],
    [moduleAddress, 'liveness']
  ]);

  const safeAddress = moduleDetails[0][0];
  const oracleAddress = moduleDetails[1][0];
  const rules = moduleDetails[2][0];
  const minimumBond = moduleDetails[3][0];
  const challengePeriod = moduleDetails[4][0];

  return {
    moduleAddress,
    safeAddress,
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

/**
 * Legacy / fallback function to fetch the details of a proposal associated with given assertion from the Optimistic Oracle V3 contract.
 */
export async function getProposalDetailsFromChain(params: {
  moduleDetails: OGModuleDetails,
  provider: StaticJsonRpcProvider,
  network: Network,
  explanation: string;
  transactions: OptimisticGovernorTransaction[]
}): Promise<ProposalDetails> {
  const { provider, network, moduleDetails, explanation, transactions } = params;
  const { moduleAddress, oracleAddress, rules } = moduleDetails;
  const moduleContract = new Contract(moduleAddress, OPTIMISTIC_GOVERNOR_ABI, provider);
  const proposalHash = getProposalHashFromTransactions(transactions);
  const claimHash = getClaimForProposalHash({
    proposalHash,
    explanation,
    rules
  });
  
  // Check for active proposals. proposal hash can be identical across assertions
  // but the explanation field should be unique. we will filter this out later.
  const assertionId: string = await moduleContract.assertionIds(proposalHash);

  const activeProposal = assertionId !==
    '0x0000000000000000000000000000000000000000000000000000000000000000';

  // Search for requests with matching ancillary data
  const oracleContract = new Contract(
    oracleAddress,
    OPTIMISTIC_ORACLE_V3_ABI,
    provider
  );
  const latestBlock = (await provider.getBlock('latest')).number;
  // modify this per chain. this should be updated with constants for all chains. start block is og deploy block.
  // this needs to be optimized to reduce loading time, currently takes a long time to parse 3k blocks at a time.
  const oGstartBlock = getDeployBlock({ network, name: 'OptimisticGovernor' });
  const oOStartBlock = getDeployBlock({ network, name: 'OptimisticOracleV3' });
  const maxRange = 3000;
  const assertionMadeEventFilter = oracleContract.filters.AssertionMade();
  const transactionsProposedEventFilter = moduleContract.filters.TransactionsProposed();
  const proposalExecutedEventFilter = moduleContract.filters.ProposalExecuted(proposalHash);

  const assertionMadeEvents = await getPagedEvents<AssertionMadeEvent>({
    contract: oracleContract,
    eventFilter: assertionMadeEventFilter,
    startBlock: oOStartBlock,
    latestBlock,
    maxRange
  });

  const transactionsProposedEvents = await getPagedEvents<TransactionsProposedEvent>({
    contract: moduleContract,
    eventFilter: transactionsProposedEventFilter,
    startBlock: oGstartBlock,
    latestBlock,
    maxRange
  });

  const proposalExecutedEvents = await getPagedEvents<ProposalExecutedEvent>({
    contract: moduleContract,
    eventFilter: proposalExecutedEventFilter,
    startBlock: oGstartBlock,
    latestBlock,
    maxRange
  });

  const thisModuleAssertionEvent = assertionMadeEvents.filter(event => {
    return (
      event.args.claim === claimHash &&
      event.args.callbackRecipient === moduleAddress
    );
  });

  // Get the full proposal events (with state).
  const fullAssertionEvent = await Promise.all(
    thisModuleAssertionEvent.map(async (event) => {
      const assertion: Assertion = await oracleContract.getAssertion(
        event.args?.assertionId
      );

      const isExpired = Math.floor(Date.now() / 1000) >= assertion.expirationTime.toNumber();
      const rejectedByOracle = assertion.settled && !assertion.settlementResolution;

      return {
        assertionId: event?.args?.assertionId,
        expirationTimestamp: assertion.expirationTime,
        isExpired: isExpired,
        isSettled: assertion.settled,
        proposalHash: proposalHash,
        proposalTxHash: event.transactionHash,
        logIndex: event.logIndex,
        rejectedByOracle,
      } as AssertionEvent;
    })
  );

  const thisProposalTransactionsProposedEvents = transactionsProposedEvents.filter(
    event => toUtf8String(event.args?.explanation) === explanation
  );

  const assertion = thisProposalTransactionsProposedEvents.map(
    tx => tx.args?.assertionId
  );

  const assertionIds = proposalExecutedEvents.map(tx => tx.args?.assertionId);

  const proposalExecuted = assertion.some(assertionId => assertionIds.includes(assertionId)
  );

  return {
    isInChallengePeriod: false,
    isSettled: false,
    isDisputed: false,
    isExecuted: false,
  };
}

/**
 *  This is intended to function identically to getProposalDetailsFromChain but use subgraphs rather than web3 events.
 * This has a lot of duplicate code on purpose. Reducing code duplication will require a risky refactor,
 * and we also want a fallback function in case the graph is down, so we will leave the original untouched for now.
 */

export async function getOGProposalStateGql(params: {
  moduleDetails: OGModuleDetails,
  network: Network,
  explanation: string;
  transactions: OptimisticGovernorTransaction[]
}): Promise<OGProposalState> {
  const { network, moduleDetails, explanation, transactions } = params;
  const { moduleAddress } = moduleDetails;

  const proposal = await findProposalGql({
    network,
    transactions,
    explanation,
    moduleAddress
  });
  
  if (!proposal) {
    return { status: 'ready-for-oo-assertion' };
  }

  const { assertionId, executed } = proposal;
  
  const hasAssertion = assertionId !==
    '0x0000000000000000000000000000000000000000000000000000000000000000';

  const assertion = await findAssertionGql({ network, assertionId })

  // if the graph says the assertion is that zero number or if the assertion cannot be found, we will return a no-assertion state.
  if (!assertion || !hasAssertion) {
    return { status: 'ready-for-oo-assertion' };
  }

  const { assertionHash, disputeHash, settlementHash, assertionLogIndex, settlementResolution } = assertion;

  // if the assertion is settled and the graph says the transactions have been executed, then we know the assertion passed and we can return early
  if (executed && settlementHash) {
    return {
      status: 'transactions-executed',
      assertionHash,
      settlementHash,
      assertionLogIndex,
    }
  }

  // if the dispute hash is not null then the assertion was disputed
  // the assertion may still have passed a vote in the oracle though,
  // so we also check if the transactions ended up being executed.
  if (disputeHash && !executed && !settlementHash) {
    return {
      status: 'assertion-disputed-in-oo',
      assertionHash,
      disputeHash,
      assertionLogIndex,
    }
  }

  // if the settlement hash exists and the settlement resolution is true, then we know that the assertion passed.
  // we already checked if the transactions were executed, so we know that the assertion passed but the transactions were not executed yet.
  if (settlementHash && settlementResolution) {
    return {
      status: 'assertion-passed-in-oo',
      assertionHash,
      settlementHash,
      assertionLogIndex,
    }
  }

  // similar to above, if the settlement hash exists but the resolution is false, then we know that the assertion failed.
  if (settlementHash && !settlementResolution) {
    return {
      status: 'assertion-failed-in-oo',
      assertionHash,
      settlementHash,
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
  return { status: 'ready-for-oo-assertion' };
}

/**
 * Fetches the details of a given proposal and its associated assertion from the Optimistic Oracle.
 */
export async function getOGProposalState(params: {
  moduleDetails: OGModuleDetails,
  network: Network,
  explanation: string;
  transactions: OptimisticGovernorTransaction[]
}): Promise<OGProposalState> {
  const { network, moduleDetails, explanation, transactions } = params;
  return await getOGProposalStateGql({
        moduleDetails,
        network,
        explanation,
        transactions
      });
  // try {
  //   // try optimized calls, which use the graph over web3 event queries
  //   return await getProposalStateGql({
  //     moduleDetails,
  //     provider,
  //     network,
  //     explanation,
  //     transactions
  //   });
  // } catch (err) {
  //   console.warn('Error querying proposal details from the graph:', err);
  //   // fall back to web3 event queries.
  //   return getProposalDetailsFromChain(
  //     {
  //       moduleDetails,
  //       provider,
  //       network,
  //       explanation,
  //       transactions
  //     }
  //   );
  // }
}

export function getProposalHashFromTransactions(transactions: OptimisticGovernorTransaction[]) {
  return keccak256(
    defaultAbiCoder.encode(
      ['(address to, uint8 operation, uint256 value, bytes data)[]'],
      [transactions]
    )
  );
}

export function getClaimForProposalHash(params: {
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