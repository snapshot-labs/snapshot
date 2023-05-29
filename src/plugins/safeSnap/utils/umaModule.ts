import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { multicall } from '@snapshot-labs/snapshot.js/src/utils';
import { UMA_MODULE_ABI, ERC20_ABI, UMA_ORACLE_ABI } from '../constants';
import { Contract } from '@ethersproject/contracts';
import { BigNumber } from '@ethersproject/bignumber';
import { keccak256 } from '@ethersproject/keccak256';
import { pack } from '@ethersproject/solidity';
import { defaultAbiCoder } from '@ethersproject/abi';
import { toUtf8Bytes, toUtf8String } from '@ethersproject/strings';
import { pageEvents } from './events';

const getBondDetailsUma = async (
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

  const bondInfo = ref({
    collateral: erc20Contract.address,
    symbol: await erc20Contract.symbol(),
    decimals: await erc20Contract.decimals(),
    currentUserBondAllowance: BigNumber.from(0),
    currentUserBalance: BigNumber.from(0)
  });

  async function updateCurrentUserBondInfo() {
    bondInfo.value.currentUserBondAllowance = BigNumber.from(
      web3Account.value
        ? await erc20Contract.allowance(web3Account.value, moduleAddress)
        : 0
    );
    bondInfo.value.currentUserBalance = BigNumber.from(
      web3Account.value ? await erc20Contract.balanceOf(web3Account.value) : 0
    );
  }
  await updateCurrentUserBondInfo();

  return bondInfo.value;
};

export const getModuleDetailsUma = async (
  provider: StaticJsonRpcProvider,
  network: string,
  moduleAddress: string,
  explanation: string,
  transactions: any
): Promise<{
  dao: string;
  oracle: string;
  rules: string;
  minimumBond: number;
  expiration: number;
  allowance: BigNumber;
  collateral: string;
  decimals: number;
  symbol: string;
  userBalance: BigNumber;
  needsBondApproval: boolean;
  noTransactions: boolean;
  activeProposal: boolean;
  assertionEvent: any;
  proposalExecuted: boolean;
  livenessPeriod: string;
}> => {
  const moduleContract = new Contract(moduleAddress, UMA_MODULE_ABI, provider);
  const moduleDetails = await multicall(network, provider, UMA_MODULE_ABI, [
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
  const bondDetails = await getBondDetailsUma(provider, moduleAddress);

  if (
    Number(minimumBond) > 0 &&
    Number(minimumBond) > Number(bondDetails.currentUserBondAllowance)
  ) {
    needsApproval = true;
  }

  // Create ancillary data for proposal hash
  let ancillaryData = '';
  let proposalHash;
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
      dao: moduleDetails[0][0],
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
      noTransactions: true,
      activeProposal: false,
      assertionEvent: {},
      proposalExecuted: false,
      livenessPeriod: livenessPeriod
    };
  }
  // Check for active proposals
  const assertionId = await moduleContract.assertionIds(proposalHash);

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
  const oGstartBlock = network === '1' ? 17167414 : 0;
  const oOStartBlock = network === '1' ? 16636058 : 0;
  const maxRange = network === '1' ? 3000 : 10000;

  const [assertionEvents, transactionsProposedEvents, executionEvents] =
    await Promise.all([
      pageEvents(
        oOStartBlock,
        latestBlock.number,
        maxRange,
        ({ start, end }: { start: number; end: number }) => {
          return oracleContract.queryFilter(
            oracleContract.filters.AssertionMade(assertionId),
            start,
            end
          );
        }
      ),
      // Check if this specific proposal has already been executed.
      // note usage of pageEvents, which query only based on a limit number of blocks within a broader range
      // this prevents block range too large errors.
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
      return oracleContract
        .getAssertion(event.args?.assertionId)
        .then(result => {
          const isExpired =
            Math.floor(Date.now() / 1000) >= Number(result.expirationTime);

          return {
            expirationTimestamp: result.expirationTime,
            isExpired: isExpired,
            isSettled: result.settled,
            proposalHash: proposalHash,
            proposalTxHash: event.transactionHash
          };
        });
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
    dao: moduleDetails[0][0],
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
