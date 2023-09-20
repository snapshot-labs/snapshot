import { TreasuryWallet } from '@/helpers/interfaces';
import { defaultAbiCoder } from '@ethersproject/abi';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { keccak256 } from '@ethersproject/keccak256';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { pack } from '@ethersproject/solidity';
import { toUtf8Bytes, toUtf8String } from '@ethersproject/strings';
import { multicall } from '@snapshot-labs/snapshot.js/src/utils';
import {
  EIP3770_PREFIXES,
  ERC20_ABI,
  UMA_MODULE_ABI,
  UMA_ORACLE_ABI,
  contractData
} from '../constants';
import { Network, OptimisticGovernorTransaction } from '../types';
import { pageEvents } from './events';

function getDeployBlock(params: {
  network: Network,
  name: string,
}): number {
  const results = contractData.filter(contract => contract.network === params.network && contract.name === params.name)
  if (results.length === 1) return results[0].deployBlock ?? 0;
  return 0;
}
function getContractSubgraph(params: {
  network: Network;
  name: string;
}): string {
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
function getOptimisticGovernorSubgraph(network: Network): string {
  return getContractSubgraph({ network, name: 'OptimisticGovernor' });
}
function getOracleV3Subgraph(network: Network): string {
  return getContractSubgraph({ network, name: 'OptimisticOracleV3' });
}

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

export const getModuleAddressForTreasury = async (network: Network, treasuryAddress: string) => {
  return Promise.resolve("0x8E8F8B2a874d82bB81a9A8fD2b719ab81fCB61d8")
}

export const getSpaceHasOsnapEnabledTreasury = async (treasuries: TreasuryWallet[]) => {
  const isOsnapEnabledOnTreasuriesResult = await Promise.all(treasuries.map(treasury => getIsOsnapEnabled(treasury.network as Network, treasury.address)))
  return isOsnapEnabledOnTreasuriesResult.some(isOsnapEnabled => isOsnapEnabled);
}

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
  const safeAddressPrefix = EIP3770_PREFIXES[network];
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

const findAssertionGql = async (
  network: Network,
  params: { assertionId: string }
) => {
  const oracleUrl = getOracleV3Subgraph(network);
  const request = `
  {
    assertion(id:"${params.assertionId}"){
      assertionId
      expirationTime
      assertionHash
      assertionLogIndex
      settlementHash
    }
  }
  `;
  const result = await queryGql(oracleUrl, request);
  return result?.assertion;
};
// Search optimistic governor for individual proposal
const findProposalGql = async (
  network: Network,
  params: { proposalHash: string; explanation: string; ogAddress: string }
) => {
  const subgraph = getOptimisticGovernorSubgraph(network);
  const request = `
  {
    proposals(where:{proposalHash:"${params.proposalHash}",explanation:"${
    params.explanation
  }",optimisticGovernor:"${params.ogAddress.toLowerCase()}"}){
      id
      executed
      assertionId
    }
  }
  `;
  const result = await queryGql(subgraph, request);
  return result?.proposals;
};

const getBondDetails = async (
  provider: StaticJsonRpcProvider,
  moduleAddress: string
) => {
  const { web3Account } = useWeb3();

  const moduleContract = new Contract(moduleAddress, UMA_MODULE_ABI, provider);

  const erc20Contract = new Contract(
    await moduleContract.collateral(),
    ERC20_ABI,
    provider
  );

  const bondInfo: {
    collateral: string;
    symbol: string;
    decimals: BigNumber;
    currentUserBondAllowance: BigNumber;
    currentUserBalance: BigNumber;
  } = {
    collateral: erc20Contract.address,
    symbol: await erc20Contract.symbol(),
    decimals: await erc20Contract.decimals(),
    currentUserBondAllowance: BigNumber.from(0),
    currentUserBalance: BigNumber.from(0)
  };

  async function updateCurrentUserBondInfo() {
    bondInfo.currentUserBondAllowance = BigNumber.from(
      web3Account.value
        ? await erc20Contract.allowance(web3Account.value, moduleAddress)
        : 0
    );
    bondInfo.currentUserBalance = BigNumber.from(
      web3Account.value ? await erc20Contract.balanceOf(web3Account.value) : 0
    );
  }
  await updateCurrentUserBondInfo();

  return bondInfo;
};

export const getModuleDetailsFromChain = async (
  provider: StaticJsonRpcProvider,
  network: Network,
  moduleAddress: string,
  explanation: string,
  transactions: OptimisticGovernorTransaction[] | undefined
) => {
  const moduleContract = new Contract(moduleAddress, UMA_MODULE_ABI, provider);
  const moduleDetails: [
    [gnosisSafeAddress: string],
    [optimisticOracleV3Address: string],
    [rules: string],
    [bondAmount: BigNumber],
    [liveness: BigNumber]
  ] = await multicall(network, provider, UMA_MODULE_ABI as any, [
    [moduleAddress, 'avatar'],
    [moduleAddress, 'optimisticOracleV3'],
    [moduleAddress, 'rules'],
    [moduleAddress, 'bondAmount'],
    [moduleAddress, 'liveness']
  ]);
  let needsApproval = false;
  const optimisticOracle = moduleDetails[1][0];
  const rules = moduleDetails[2][0];
  const minimumBond = moduleDetails[3][0];
  const livenessPeriod = moduleDetails[4][0];
  const bondDetails = await getBondDetails(provider, moduleAddress);

  if (
    Number(minimumBond) > 0 &&
    Number(minimumBond) > Number(bondDetails.currentUserBondAllowance)
  ) {
    needsApproval = true;
  }

  // Create ancillary data for proposal hash
  let ancillaryData = '';
  let proposalHash: string;
  if (transactions !== undefined) {
    proposalHash = keccak256(
      defaultAbiCoder.encode(
        ['(address to, uint8 operation, uint256 value, bytes data)[]'],
        [transactions]
      )
    );

    ancillaryData = pack(
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
  } else {
    return {
      gnosisSafeAddress: moduleDetails[0][0],
      oracle: moduleDetails[1][0],
      rules: moduleDetails[2][0],
      expiration: moduleDetails[4][0],
      minimumBond,
      allowance: bondDetails.currentUserBondAllowance,
      collateral: bondDetails.collateral,
      decimals: bondDetails.decimals,
      symbol: bondDetails.symbol,
      userBalance: bondDetails.currentUserBalance,
      needsBondApproval: needsApproval,
      noTransactions: true,
      activeProposal: false,
      assertionEvent: undefined,
      proposalExecuted: false,
      livenessPeriod
    };
  }
  // Check for active proposals. proposal hash can be identical across assertions
  // but the explanation field should be unique. we will filter this out later.
  const assertionId: string = await moduleContract.assertionIds(proposalHash);

  const activeProposal =
    assertionId !==
    '0x0000000000000000000000000000000000000000000000000000000000000000';

  // Search for requests with matching ancillary data
  const oracleContract = new Contract(
    optimisticOracle,
    UMA_ORACLE_ABI,
    provider
  );
  const latestBlock = await provider.getBlock('latest');
  // modify this per chain. this should be updated with constants for all chains. start block is og deploy block.
  // this needs to be optimized to reduce loading time, currently takes a long time to parse 3k blocks at a time.
  const oGstartBlock = getDeployBlock({network, name: 'OptimisticGovernor'});
  const oOStartBlock = getDeployBlock({network, name: 'OptimisticOracleV3'});
  const maxRange = 3000;

  const [assertionEvents, transactionsProposedEvents, executionEvents] =
    await Promise.all([
      pageEvents(
        oOStartBlock,
        latestBlock.number,
        maxRange,
        ({ start, end }: { start: number; end: number }) => {
          return oracleContract.queryFilter(
            oracleContract.filters.AssertionMade(),
            start,
            end
          );
        }
      ),
      pageEvents(
        oGstartBlock,
        latestBlock.number,
        maxRange,
        ({ start, end }: { start: number; end: number }) => {
          return moduleContract.queryFilter(
            moduleContract.filters.TransactionsProposed(),
            start,
            end
          );
        }
      ),
      pageEvents(
        oGstartBlock,
        latestBlock.number,
        maxRange,
        ({ start, end }: { start: number; end: number }) => {
          return moduleContract.queryFilter(
            moduleContract.filters.ProposalExecuted(proposalHash),
            start,
            end
          );
        }
      )
    ]);

  const thisModuleAssertionEvent = assertionEvents.filter(event => {
    return (
      event.args?.claim === ancillaryData &&
      event.args?.callbackRecipient === moduleAddress
    );
  });

  // Get the full proposal events (with state).
  const fullAssertionEvent = await Promise.all(
    thisModuleAssertionEvent.map(async event => {
      const assertion = await oracleContract.getAssertion(
        event.args?.assertionId
      );

      const isExpired =
        Math.floor(Date.now() / 1000) >= assertion.expirationTime.toNumber();

      return {
        assertionId: event?.args?.assertionId,
        expirationTimestamp: assertion.expirationTime,
        isExpired: isExpired,
        isSettled: assertion.settled,
        proposalHash: proposalHash,
        proposalTxHash: event.transactionHash,
        logIndex: event.logIndex
      };
    })
  );

  const thisProposalTransactionsProposedEvents =
    transactionsProposedEvents.filter(
      event => toUtf8String(event.args?.explanation) === explanation
    );

  const assertion = thisProposalTransactionsProposedEvents.map(
    tx => tx.args?.assertionId
  );

  const assertionIds = executionEvents.map(tx => tx.args?.assertionId);

  const proposalExecuted = assertion.some(assertionId =>
    assertionIds.includes(assertionId)
  );

  return {
    gnosisSafeAddress: moduleDetails[0][0],
    oracle: moduleDetails[1][0],
    rules: moduleDetails[2][0],
    minimumBond: minimumBond,
    expiration: moduleDetails[4][0],
    allowance: bondDetails.currentUserBondAllowance,
    collateral: bondDetails.collateral,
    decimals: bondDetails.decimals,
    symbol: bondDetails.symbol,
    userBalance: bondDetails.currentUserBalance,
    needsBondApproval: needsApproval,
    noTransactions: false,
    activeProposal: activeProposal,
    assertionEvent: fullAssertionEvent[0],
    proposalExecuted: proposalExecuted,
    livenessPeriod: livenessPeriod.toString()
  };
};

// This is intended to function identically to getModuleDetailsUma but use subgraphs rather than web3 events.
// This has a lot of duplicate code on purpose. Reducing code duplication will require a risky refactor,
// and we also want a fallback function in case the graph is down, so we will leave the original untouched for now.
export const getModuleDetailsGql = async (
  provider: StaticJsonRpcProvider,
  network: Network,
  moduleAddress: string,
  explanation: string,
  transactions: OptimisticGovernorTransaction[] | undefined
) => {
  const moduleContract = new Contract(moduleAddress, UMA_MODULE_ABI, provider);
  const moduleDetails: [
    [gnosisSafeAddress: string],
    [optimisticOracleV3Address: string],
    [rules: string],
    [bondAmount: BigNumber],
    [liveness: BigNumber]
  ] = await multicall(network, provider, UMA_MODULE_ABI as any, [
    [moduleAddress, 'avatar'],
    [moduleAddress, 'optimisticOracleV3'],
    [moduleAddress, 'rules'],
    [moduleAddress, 'bondAmount'],
    [moduleAddress, 'liveness']
  ]);
  let needsApproval = false;
  const minimumBond = moduleDetails[3][0];
  const livenessPeriod = moduleDetails[4][0];
  const bondDetails = await getBondDetails(provider, moduleAddress);

  if (
    Number(minimumBond) > 0 &&
    Number(minimumBond) > Number(bondDetails.currentUserBondAllowance)
  ) {
    needsApproval = true;
  }

  let proposalHash: string;
  let encodedExplanation: string;
  if (transactions !== undefined && explanation !== undefined) {
    proposalHash = keccak256(
      defaultAbiCoder.encode(
        ['(address to, uint8 operation, uint256 value, bytes data)[]'],
        [transactions]
      )
    );
    encodedExplanation = pack(
      ['bytes'],
      [toUtf8Bytes(explanation.replace(/^0x/, ''))]
    );
  } else {
    return {
      gnosisSafeAddress: moduleDetails[0][0],
      oracleAddress: moduleDetails[1][0],
      rules: moduleDetails[2][0],
      minimumBond: minimumBond,
      expiration: moduleDetails[4][0],
      allowance: bondDetails.currentUserBondAllowance,
      collateral: bondDetails.collateral,
      decimals: bondDetails.decimals,
      symbol: bondDetails.symbol,
      userBalance: bondDetails.currentUserBalance,
      needsBondApproval: needsApproval,
      noTransactions: true,
      activeProposal: false,
      assertionEvent: undefined,
      proposalExecuted: false,
      livenessPeriod: livenessPeriod
    };
  }
  // Check for active proposals. proposal hash can be identical across assertions
  // but the explanation field should be unique. we will filter this out later.
  const assertionId = await moduleContract.assertionIds(proposalHash);

  const activeProposal =
    assertionId !==
    '0x0000000000000000000000000000000000000000000000000000000000000000';

  const [proposal] = await findProposalGql(network, {
    proposalHash,
    explanation: encodedExplanation,
    ogAddress: moduleAddress
  });
  const proposalExecuted = proposal?.executed ? true : false;
  const assertion = proposal?.assertionId
    ? await findAssertionGql(network, { assertionId: proposal.assertionId })
    : undefined;

  const assertionEvent = assertion
    ? {
        assertionId: assertion.assertionId,
        expirationTimestamp: BigNumber.from(assertion.expirationTime),
        isExpired:
          Math.floor(Date.now() / 1000) >= Number(assertion.expirationTime),
        isSettled: assertion.settlementHash ? true : false,
        proposalHash,
        proposalTxHash: assertion.assertionHash,
        logIndex: assertion.assertionLogIndex
      }
    : undefined;

  return {
    gnosisSafeAddress: moduleDetails[0][0],
    oracleAddress: moduleDetails[1][0],
    rules: moduleDetails[2][0],
    minimumBond: minimumBond,
    expiration: moduleDetails[4][0],
    allowance: bondDetails.currentUserBondAllowance,
    collateral: bondDetails.collateral,
    decimals: bondDetails.decimals,
    symbol: bondDetails.symbol,
    userBalance: bondDetails.currentUserBalance,
    needsBondApproval: needsApproval,
    noTransactions: false,
    activeProposal,
    assertionEvent,
    proposalExecuted,
    livenessPeriod: livenessPeriod.toString()
  };
};

export function createFormattedOptimisticGovernorTransaction({
  to,
  value,
  data,
}: {
  to: string;
  value: string;
  data: string;
}): OptimisticGovernorTransaction {
  return [
    to,
    0,
    value,
    data,
  ]
}