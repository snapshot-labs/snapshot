import { computed, ref, watch } from 'vue';
import { defaultAbiCoder } from '@ethersproject/abi';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract, Event } from '@ethersproject/contracts';
import { keccak256 } from '@ethersproject/keccak256';
import { pack } from '@ethersproject/solidity';
import { toUtf8Bytes } from '@ethersproject/strings';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import UMA_MODULE_ABI from '@/helpers/abi/UMA_MODULE.json';
import UMA_ORACLE_ABI from '@/helpers/abi/UMA_ORACLE.json';
import UMA_VOTING_ABI from '@/helpers/abi/UMA_VOTING.json';
import FINDER_ABI from '@/helpers/abi/FINDER.json';
import ERC20_ABI from '@/helpers/abi/ERC20.json';
import { Proposal } from '@/helpers/interfaces';
import { ModuleExecutionData } from '@/helpers/safe';
import {
  convertExecutionDataToModuleTransactions,
  Transaction
} from '@/helpers/transactionBuilder';
import { useWeb3, useTxStatus } from '@/composables';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { hexlify } from '@ethersproject/bytes';
import { useTimestamp } from '@vueuse/core';

// "ZODIAC"
const ZODIAC_IDENTIFIER =
  '0x5a4f444941430000000000000000000000000000000000000000000000000000';
const APPROVE_ANSWER = '1000000000000000000';

enum UmaOracleRequestState {
  INVALID, // Never requested.
  REQUESTED, // Requested, no other actions taken.
  PROPOSED, // Proposed, but not expired or disputed yet.
  EXPIRED, // Proposed, not disputed, past liveness.
  DISPUTED, // Disputed, but no DVM price returned yet.
  RESOLVED, // Disputed and DVM price is available.
  SETTLED // Final price has been set in the contract (can get here from Expired or Resolved).
}

function getExecutionIdentifiers(
  transactions: Transaction[],
  executionDataIndex: number,
  proposalId: string
) {
  const transactionsHash = keccak256(
    defaultAbiCoder.encode(
      ['(address to, uint8 operation, uint256 value, bytes data)[]'],
      [transactions]
    )
  );
  const explanation = `${proposalId}${hexlify([executionDataIndex]).replace(
    '0x',
    ''
  )}`;
  const ancillaryData = pack(
    ['string', 'bytes', 'bytes'],
    [
      '',
      pack(['string', 'string'], ['proposalHash', ':']),
      toUtf8Bytes(transactionsHash.replace('0x', ''))
    ]
  );

  return {
    transactionsHash,
    explanation,
    ancillaryData
  };
}

async function initContracts(executionData: ModuleExecutionData) {
  const readProvider = getProvider(executionData.safe.network);

  // https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/zodiac/OptimisticGovernor.sol
  const moduleContract = new Contract(
    executionData.module.address,
    UMA_MODULE_ABI,
    readProvider
  );

  // https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/oracle/implementation/OptimisticOracleV2.sol
  const oracleContract = new Contract(
    await moduleContract.optimisticOracle(),
    UMA_ORACLE_ABI,
    readProvider
  );

  const finderContract = new Contract(
    await oracleContract.finder(),
    FINDER_ABI,
    readProvider
  );

  // https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/oracle/implementation/VotingV2.sol
  const votingContract = new Contract(
    await finderContract.getImplementationAddress(
      '0x4f7261636c650000000000000000000000000000000000000000000000000000'
    ),
    UMA_VOTING_ABI,
    readProvider
  );

  const bondContract = new Contract(
    await moduleContract.collateral(),
    ERC20_ABI,
    readProvider
  );

  return {
    moduleContract,
    oracleContract,
    votingContract,
    bondContract
  };
}

export async function useExecutorUma(
  executionDataIndex: number,
  executionData: ModuleExecutionData,
  proposal: Proposal
) {
  const loading = ref<boolean>(false);
  const { pendingCount } = useTxStatus();
  const { web3Account } = useWeb3();
  const now = computed(
    () => useTimestamp({ offset: 0, interval: 1000 }).value / 1000
  );

  const transactions = convertExecutionDataToModuleTransactions(executionData);

  const { transactionsHash, explanation, ancillaryData } =
    getExecutionIdentifiers(transactions, executionDataIndex, proposal.id);

  const { moduleContract, oracleContract, votingContract, bondContract } =
    await initContracts(executionData);

  const allProposalEvents = ref<Event[]>([]);
  const allSettleEvents = ref<Event[]>([]);

  const allProposalEventsForTransactionsHash = computed<Event[]>(() =>
    allProposalEvents.value.filter(
      event => event.args?.proposalHash === transactionsHash
    )
  );
  const allSettleEventsForTransactionsHash = computed<Event[]>(() =>
    allSettleEvents.value.filter(
      event => event.args?.ancillaryData === ancillaryData
    )
  );

  const proposalEvent = computed<Event | undefined>(() =>
    allProposalEventsForTransactionsHash.value.find(
      event => event.args?.explanation === explanation
    )
  );
  const settleEvent = computed<Event | undefined>(() =>
    allSettleEventsForTransactionsHash.value.find(
      event =>
        event.args?.ancillaryData === ancillaryData &&
        event.args?.timestamp.eq(proposalEvent.value?.args?.proposalTime)
    )
  );

  const proposedAt = computed<BigNumber>(
    () => proposalEvent.value?.args?.proposalTime || BigNumber.from(0)
  );

  const isWaitingForOtherProposal = computed<boolean>(
    () =>
      !proposalEvent.value &&
      allProposalEventsForTransactionsHash.value.length >
        allSettleEventsForTransactionsHash.value.length
  );

  const oracleState = ref<UmaOracleRequestState>(UmaOracleRequestState.INVALID);
  const oracleHasDisputeResult = ref(false);
  const oracleDisputeResult = ref(false);

  const disputeTime = BigNumber.from(
    await moduleContract.liveness()
  ).toNumber();

  const disputeCountdown = computed(() =>
    Math.max(proposedAt.value.toNumber() + disputeTime - now.value, 0).toFixed(
      0
    )
  );

  watch(disputeCountdown, (current, old) => {
    if (current === '0' && old !== '0') {
      updateState();
    }
  });

  const bondInfo = ref({
    requiredAmount: BigNumber.from(await moduleContract.bondAmount()),
    symbol: await bondContract.symbol(),
    decimals: await bondContract.decimals(),
    currentUserModuleAllowance: BigNumber.from(0),
    currentUserOracleAllowance: BigNumber.from(0),
    currentUserBalance: BigNumber.from(0)
  });

  const isProposed = computed(
    () => UmaOracleRequestState.PROPOSED === oracleState.value
  );
  const isDisputed = computed(
    () => UmaOracleRequestState.DISPUTED === oracleState.value
  );
  const isSettled = computed(
    () => UmaOracleRequestState.SETTLED === oracleState.value
  );
  const isExecuted = computed(
    () => isSettled.value && settleEvent.value?.args?.price.eq(APPROVE_ANSWER)
  );
  const isRejected = computed(
    () => isSettled.value && !settleEvent.value?.args?.price.eq(APPROVE_ANSWER)
  );
  const isExecutable = computed(
    () =>
      oracleState.value === UmaOracleRequestState.EXPIRED ||
      (oracleState.value === UmaOracleRequestState.RESOLVED &&
        oracleDisputeResult.value)
  );
  const isRejectable = computed(
    () =>
      oracleState.value === UmaOracleRequestState.RESOLVED &&
      !oracleDisputeResult.value
  );

  async function updateEventHistory() {
    allProposalEvents.value = await moduleContract.queryFilter(
      moduleContract.filters.TransactionsProposed()
    );

    allSettleEvents.value = await oracleContract.queryFilter(
      oracleContract.filters.Settle(executionData.module.address)
    );
  }

  async function updateOracleState() {
    oracleState.value = await oracleContract.getState(
      executionData.module.address,
      ZODIAC_IDENTIFIER,
      proposedAt.value,
      ancillaryData
    );

    oracleHasDisputeResult.value = await votingContract[
      'hasPrice(bytes32,uint256,bytes)'
    ](ZODIAC_IDENTIFIER, proposedAt.value, ancillaryData);

    if (oracleHasDisputeResult.value) {
      oracleDisputeResult.value =
        (await votingContract['getPrice(bytes32,uint256,bytes)'](
          ZODIAC_IDENTIFIER,
          proposedAt.value,
          ancillaryData
        )) === APPROVE_ANSWER;
    }
  }

  async function updateCurrentUserBondInfo() {
    bondInfo.value.currentUserModuleAllowance = BigNumber.from(
      web3Account.value
        ? await bondContract.allowance(
            web3Account.value,
            executionData.module.address
          )
        : 0
    );
    bondInfo.value.currentUserOracleAllowance = BigNumber.from(
      web3Account.value
        ? await bondContract.allowance(
            web3Account.value,
            oracleContract.address
          )
        : 0
    );
    bondInfo.value.currentUserBalance = BigNumber.from(
      web3Account.value ? await bondContract.balanceOf(web3Account.value) : 0
    );
  }

  watch(web3Account, updateCurrentUserBondInfo);

  async function updateState() {
    loading.value = true;

    await updateEventHistory();
    await updateOracleState();
    await updateCurrentUserBondInfo();

    loading.value = false;
  }

  await updateState();

  async function propose() {
    loading.value = true;
    try {
      const tx = await moduleContract
        .connect(getInstance().web3.getSigner())
        .proposeTransactions(transactions, explanation);

      pendingCount.value++;
      await tx.wait(4);
      pendingCount.value--;

      await updateState();
    } finally {
      loading.value = false;
    }
  }

  async function dispute() {
    loading.value = true;
    try {
      const tx = await oracleContract
        .connect(getInstance().web3.getSigner())
        .disputePrice(
          executionData.module.address,
          ZODIAC_IDENTIFIER,
          proposedAt.value,
          ancillaryData
        );

      pendingCount.value++;
      await tx.wait(4);
      pendingCount.value--;

      await updateState();
    } finally {
      loading.value = false;
    }
  }

  async function execute() {
    loading.value = true;
    try {
      const tx = await moduleContract
        .connect(getInstance().web3.getSigner())
        .executeProposal(transactions);

      pendingCount.value++;
      await tx.wait(4);
      pendingCount.value--;

      await updateState();
    } finally {
      loading.value = false;
    }
  }

  async function settleRejected() {
    loading.value = true;
    try {
      const tx = await oracleContract
        .connect(getInstance().web3.getSigner())
        .deleteRejectedProposal(transactionsHash);

      pendingCount.value++;
      await tx.wait(4);
      pendingCount.value--;

      await updateState();
    } finally {
      loading.value = false;
    }
  }

  async function approveBond(spender: string, amount: BigNumber) {
    loading.value = true;
    try {
      const tx = await bondContract
        .connect(getInstance().web3.getSigner())
        .approve(spender, amount);

      pendingCount.value++;
      await tx.wait(4);
      pendingCount.value--;

      await updateState();
    } finally {
      loading.value = false;
    }
  }

  return {
    propose,
    dispute,
    execute,
    settleRejected,
    approveBond,
    loading,
    oracleContract,
    bondInfo,
    proposedAt,
    disputeCountdown,
    isWaitingForOtherProposal,
    isProposed,
    isDisputed,
    isExecuted,
    isRejected,
    isExecutable,
    isRejectable
  };
}
