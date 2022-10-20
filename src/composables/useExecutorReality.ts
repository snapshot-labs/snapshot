import { computed, ref } from 'vue';
import { HashZero } from '@ethersproject/constants';
import { ExecutionState, Executor, ModuleExecutionData } from '@/helpers/safe';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { useTimestamp } from '@vueuse/core';
import {
  useExecutorRealityModule,
  useExecutorRealityOracle,
  useTxStatus
} from '@/composables';
import { Proposal } from '@/helpers/interfaces';

export async function useExecutorReality(
  executionData: ModuleExecutionData,
  proposal: Proposal
): Promise<Executor> {
  const now = useTimestamp({ offset: 0 });
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
    bondAllowance,
    bondNextAmount,
    answerHistoryHashes,
    involvedUsers,
    placedBonds,
    givenAnswers,
    updateOracleAnswer,
    updateDisputeHistory,
    updateBondInfo
  } = await useExecutorRealityOracle(
    executionData,
    proposal,
    oracleAddress,
    questionId,
    minimumBond
  );

  async function updateState() {
    loading.value = true;

    await updateTransactionExecutionStates();
    await updateOracleAnswer();
    await updateDisputeHistory();
    await updateBondInfo();

    loading.value = false;
  }

  async function propose() {
    loading.value = true;
    try {
      const tx = await moduleContract
        .connect(getInstance().web3.getSigner())
        .addProposal(proposal.id, transactionHashes);

      pendingCount.value++;
      await tx.wait();
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
        .submitAnswerERC20(questionId, answerBytesString);

      pendingCount.value++;
      await tx.wait();
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
        .submitAnswer(questionId, answerBytesString, {
          value: bondNextAmount.value
        });

      pendingCount.value++;
      await tx.wait();
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
          nextTransactionToExecute
        );

      pendingCount.value++;
      await tx.wait();
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
      await tx.wait();
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
      await tx.wait();
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
          givenAnswers.value
        );

      pendingCount.value++;
      await tx.wait();
      pendingCount.value--;

      await updateState();
    } finally {
      loading.value = false;
    }
  }

  const INVALID_QUESTION_ID =
    '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF';

  const executionState = computed<ExecutionState>(() => {
    if (now.value <= proposal.end) return ExecutionState.WAITING;

    if (questionId === INVALID_QUESTION_ID) return ExecutionState.INVALIDATED;
    if (questionId === HashZero) return ExecutionState.PROPOSABLE;

    if (allTransactionsExecuted.value) return ExecutionState.EXECUTED;

    if (!isOracleAnswerFinal) return ExecutionState.DISPUTABLE;

    if (oracleAnswer.value === false) return ExecutionState.REJECTED;

    if (oracleAnswer.value === true) return ExecutionState.EXECUTABLE;

    return ExecutionState.UNKNOWN;
  });

  return {
    loading,
    executionState,
    executionData,
    propose,
    dispute,
    execute,
    cooldownPeriod,
    expirationPeriod,
    oracleAnswer,
    oracleAnswerFinalizedAt,
    bondAllowance,
    bondSymbol,
    bondDecimals,
    approveBond,
    withdrawBondBalance,
    assignBondBalancesAndWithdraw,
    nextTransactionToExecute
  };
}
