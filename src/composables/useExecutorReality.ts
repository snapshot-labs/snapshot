import { computed, ref } from 'vue';
import { HashZero } from '@ethersproject/constants';
import { Executor, ModuleExecutionData } from '@/helpers/safe';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { useTimestamp } from '@vueuse/core';
import {
  useExecutorRealityModule,
  useExecutorRealityOracle,
  useTxStatus
} from '@/composables';
import { Proposal } from '@/helpers/interfaces';

const INVALID_QUESTION_ID =
  '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF';

const HashOne =
  '0x0000000000000000000000000000000000000000000000000000000000000001';

export enum RealityExecutionState {
  WAITING = 'waiting',
  PROPOSABLE = 'proposable',
  DISPUTABLE = 'disputable',
  EXECUTABLE = 'executable',
  EXECUTED = 'executed',
  REJECTED = 'rejected',
  INVALIDATED = 'invalidated',
  EXPIRED = 'expired',
  UNKNOWN = 'unknown'
}

export async function useExecutorReality(
  executionData: ModuleExecutionData,
  proposal: Proposal
): Promise<Executor<RealityExecutionState>> {
  const now = computed(
    () => useTimestamp({ offset: 0, interval: 1000 }).value / 1000
  );
  const loading = ref<boolean>(false);
  const { pendingCount } = useTxStatus();

  const {
    moduleContract,
    transactions,
    transactionHashes,
    nextTransactionToExecute,
    allTransactionsExecuted,
    questionId,
    cooldownPeriod,
    expirationPeriod,
    minimumBond,
    updateTransactionExecutionStates
  } = await useExecutorRealityModule(executionData, proposal);

  const oracleAddress = await moduleContract.oracle();

  const {
    oracleContract,
    oracleAnswer,
    isOracleAnswerFinal,
    oracleAnswerFinalizedAt,
    bondContract,
    bondDecimals,
    bondSymbol,
    currentUserBondAllowance,
    withdrawableUserBondBalance,
    bondCurrentAmount,
    bondNextAmount,
    involvedUsers,
    placedBonds,
    givenAnswers,
    answerHistoryHashes,
    allBondsAssigned,
    currentUserVotedForCorrectAnswer,
    updateOracleAnswer,
    updateDisputeHistory,
    updateBondInfo
  } = await useExecutorRealityOracle(
    executionData,
    proposal,
    oracleAddress,
    questionId,
    minimumBond,
    now
  );

  // TODO: This creates quite some load time. Consider refactoring to load data more lazily/specifically.
  async function updateState() {
    loading.value = true;

    await updateTransactionExecutionStates();
    await updateOracleAnswer();
    await updateDisputeHistory();
    await updateBondInfo();

    loading.value = false;
  }

  await updateState();

  async function propose() {
    loading.value = true;
    try {
      const tx = await moduleContract
        .connect(getInstance().web3.getSigner())
        .addProposal(proposal.id, transactionHashes);

      pendingCount.value++;
      await tx.wait(3);
      pendingCount.value--;

      await updateState();
    } finally {
      loading.value = false;
    }
  }

  async function dispute(answer: boolean) {
    const answerBytesString = HashZero.replace(/.$/, answer ? '1' : '0');

    if (bondContract) {
      await disputeERC20(answerBytesString);
    } else {
      await disputeETH(answerBytesString);
    }
  }

  async function disputeERC20(answerBytesString: string) {
    loading.value = true;

    try {
      const tx = await oracleContract
        .connect(getInstance().web3.getSigner())
        .submitAnswerERC20(
          questionId,
          answerBytesString,
          bondCurrentAmount.value,
          bondNextAmount.value
        );

      pendingCount.value++;
      await tx.wait(3);
      pendingCount.value--;

      await updateState();
    } finally {
      loading.value = false;
    }
  }

  async function disputeETH(answerBytesString: string) {
    loading.value = true;

    try {
      const tx = await oracleContract
        .connect(getInstance().web3.getSigner())
        .submitAnswer(questionId, answerBytesString, bondCurrentAmount.value, {
          value: bondNextAmount.value.toString()
        });

      pendingCount.value++;
      await tx.wait(3);
      pendingCount.value--;

      await updateState();
    } finally {
      loading.value = false;
    }
  }

  async function execute() {
    if (nextTransactionToExecute.value === null) return;

    const transaction = transactions[nextTransactionToExecute.value];

    loading.value = true;
    try {
      const tx = await moduleContract
        .connect(getInstance().web3.getSigner())
        .executeProposalWithIndex(
          proposal.id,
          transactionHashes,
          transaction.to,
          transaction.value,
          transaction.data || '0x',
          transaction.operation,
          nextTransactionToExecute.value
        );

      pendingCount.value++;
      await tx.wait(3);
      pendingCount.value--;

      await updateState();
    } finally {
      loading.value = false;
    }
  }

  async function approveBond() {
    if (!bondContract) return;

    loading.value = true;

    try {
      const tx = await bondContract
        .connect(getInstance().web3.getSigner())
        .approve(oracleAddress, bondNextAmount.value);

      pendingCount.value++;
      await tx.wait(3);
      pendingCount.value--;

      await updateState();
    } finally {
      loading.value = false;
    }
  }

  async function withdrawBondBalance() {
    loading.value = true;

    try {
      const tx = await oracleContract
        .connect(getInstance().web3.getSigner())
        .withdraw();

      pendingCount.value++;
      await tx.wait(3);
      pendingCount.value--;

      await updateState();
    } finally {
      loading.value = false;
    }
  }

  async function assignBondBalancesAndWithdraw() {
    loading.value = true;

    try {
      const tx = await oracleContract
        .connect(getInstance().web3.getSigner())
        .claimMultipleAndWithdrawBalance(
          [questionId],
          [placedBonds.value.length],
          answerHistoryHashes.value,
          involvedUsers.value,
          placedBonds.value,
          givenAnswers.value.map(answer => (answer ? HashOne : HashZero))
        );

      pendingCount.value++;
      await tx.wait(3);
      pendingCount.value--;

      await updateState();
    } finally {
      loading.value = false;
    }
  }

  const state = computed<RealityExecutionState>(() => {
    if (now.value <= proposal.end) return RealityExecutionState.WAITING;

    if (questionId === INVALID_QUESTION_ID)
      return RealityExecutionState.INVALIDATED;
    if (questionId === HashZero) return RealityExecutionState.PROPOSABLE;

    if (allTransactionsExecuted.value) return RealityExecutionState.EXECUTED;

    if (!isOracleAnswerFinal.value) return RealityExecutionState.DISPUTABLE;

    if (oracleAnswer.value === false) return RealityExecutionState.REJECTED;

    if (oracleAnswer.value === true) return RealityExecutionState.EXECUTABLE;

    return RealityExecutionState.UNKNOWN;
  });

  return {
    loading,
    state,
    propose,
    dispute,
    execute,
    now,
    cooldownPeriod,
    expirationPeriod,
    oracleContract,
    oracleAnswer,
    oracleAnswerFinalizedAt,
    currentUserBondAllowance,
    withdrawableUserBondBalance,
    hasBondToken: bondContract !== null,
    bondSymbol,
    bondDecimals,
    bondNextAmount,
    allBondsAssigned,
    currentUserVotedForCorrectAnswer,
    approveBond,
    withdrawBondBalance,
    assignBondBalancesAndWithdraw,
    nextTransactionToExecute
  };
}
