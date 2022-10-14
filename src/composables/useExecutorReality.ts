import { computed, ref, watch } from 'vue';
import { HashZero, AddressZero } from '@ethersproject/constants';
import { _TypedDataEncoder } from '@ethersproject/hash';
import {
  EIP712_SAFE_TRANSACTIN_TYPES,
  ExecutionState,
  Executor,
  getNativeCoinInfo,
  ModuleExecutionData
} from '@/helpers/safe';
import {
  convertBatchToMultisendTransaction,
  convertToExecutableTransaction,
  ExecutableTransaction
} from '@/helpers/transactionBuilder';
import ERC20_ABI from '@/helpers/abi/ERC20.json';
import REALITY_MODULE_ABI from '@/helpers/abi/REALITY_MODULE.json';
import REALITY_ORACLE_ETH_ABI from '@/helpers/abi/REALITY_ORACLE_ETH.json';
import REALITY_ORACLE_ERC_ABI from '@/helpers/abi/REALITY_ORACLE_ERC.json';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { keccak256 } from '@ethersproject/solidity';
import { BigNumber } from '@ethersproject/bignumber';
import { useTimestamp } from '@vueuse/core';
import { Contract } from '@ethersproject/contracts';
import { useTxStatus, useWeb3 } from '@/composables';
import { Proposal } from '@/helpers/interfaces';
import { parseUnits } from '@ethersproject/units';

function calcTransactionHash(
  chainId: string,
  verifyingContract: string,
  transaction: ExecutableTransaction,
  nonce = '0'
) {
  const domain = { chainId, verifyingContract };

  return _TypedDataEncoder.hash(domain, EIP712_SAFE_TRANSACTIN_TYPES, {
    ...transaction,
    data: transaction.data || '0x',
    nonce
  });
}

function convertExecutionDataToRealityTransactions(
  executionData: ModuleExecutionData
): ExecutableTransaction[] {
  return executionData.batches
    .map(batch => {
      if (!batch.length) return null;

      if (batch.length === 1) {
        return convertToExecutableTransaction(batch[0]);
      } else {
        return convertBatchToMultisendTransaction(
          batch.map(tx => convertToExecutableTransaction(tx)),
          executionData.safe.network
        );
      }
    })
    .filter(tx => tx !== null) as ExecutableTransaction[];
}

export async function useExecutorReality(
  executionData: ModuleExecutionData,
  proposal: Proposal
): Promise<Executor> {
  const now = useTimestamp({ offset: 0 });
  const loading = ref<boolean>(false);
  const readProvider = getProvider(executionData.safe.network);
  const { web3Account } = useWeb3();
  const { pendingCount } = useTxStatus();
  const nativeToken = getNativeCoinInfo(executionData.safe.network);

  const transactions = convertExecutionDataToRealityTransactions(executionData);
  const transactionHashes = transactions.map((executableTransaction, nonce) =>
    calcTransactionHash(
      executionData.safe.network,
      executionData.module.address,
      executableTransaction,
      nonce.toString()
    )
  );

  const moduleContract = new Contract(
    executionData.module.address,
    REALITY_MODULE_ABI,
    readProvider
  );

  const cooldown = await moduleContract.questionCooldown();
  const expiration = await moduleContract.answerExpiration();
  const minimumBond = BigNumber.from(await moduleContract.minimumBond());
  const question = await moduleContract.buildQuestion(
    proposal.id,
    transactionHashes
  );
  const questionHash = keccak256(['string'], [question]);
  const questionId = await moduleContract.questionIds(questionHash);

  const oracleAddress = await moduleContract.oracle();

  // assume an ERC20 oracle first
  let oracleContract = new Contract(
    oracleAddress,
    REALITY_ORACLE_ERC_ABI,
    readProvider
  );

  let bondAddress = AddressZero;
  let bondContract = new Contract(bondAddress, ERC20_ABI, readProvider);
  let bondDecimals = 18;
  let bondSymbol = getNativeCoinInfo(executionData.safe.network).symbol;

  try {
    // There is no way to determine whether we are dealing with an ETH or ERC20 oracle, other than trying to call the token method.
    // If this throws, we have an ETH oracle. If it doesn't, we have an ERC20 oracle and the address of the collateral token.
    bondAddress = await oracleContract.token();
    bondContract = bondContract.attach(bondAddress);
    bondDecimals = await bondContract.decimals();
    bondSymbol = await bondContract.symbol();
  } catch {
    oracleContract = new Contract(
      oracleAddress,
      REALITY_ORACLE_ETH_ABI,
      readProvider
    );
  }

  const bondAllowance = ref<BigNumber>(BigNumber.from(0));
  const bondCurrentAmount = ref<BigNumber>(BigNumber.from(0));
  const bondNextAmount = computed<BigNumber>(() => {
    // RealityModule can have 0 minimumBond, if it happens, the minimum bond will be 1 token
    if (bondCurrentAmount.value.eq(0)) {
      return minimumBond.eq(0) ? parseUnits('1', bondDecimals) : minimumBond;
    } else {
      return bondCurrentAmount.value.mul(2);
    }
  });
  const withdrawableUserBondBalance = ref<BigNumber>(BigNumber.from(0));
  const bestAnswer = ref<boolean>(false);
  const currentHistoryHash = ref<string>(HashZero);
  const isFinalized = ref<boolean>(false);

  const questionAnswer = ref<boolean>(false);
  const finalizedAt = ref<number>(0);
  const nextTransactionToExecute = ref<number>(-1);

  const involvedUsers = ref<string[]>([]);
  const placedBonds = ref<BigNumber[]>([]);
  const givenAnswers = ref<boolean[]>([]);
  const answerHistoryHashes = ref<string[]>([]);
  const answersFilter = oracleContract.filters.LogNewAnswer(null, questionId);

  async function setState() {
    loading.value = true;

    await setNextTransactionToExecute();

    bondCurrentAmount.value = BigNumber.from(
      await oracleContract.getBond(questionId)
    );
    withdrawableUserBondBalance.value = BigNumber.from(
      await oracleContract.balanceOf(web3Account.value)
    );
    bestAnswer.value =
      (await oracleContract.getBestAnswer(questionId)) !== HashZero;
    currentHistoryHash.value = await oracleContract.getHistoryHash(questionId);
    isFinalized.value = await oracleContract.isFinalized(questionId);
    finalizedAt.value = await oracleContract.getFinalizeTS(questionId);
    questionAnswer.value = BigNumber.from(
      await oracleContract.resultFor(questionId)
    ).eq(BigNumber.from(1));

    await setBondData();

    loading.value = false;
  }

  async function setBondAllowance() {
    bondAllowance.value = BigNumber.from(
      web3Account.value
        ? await bondContract.allowance(web3Account.value, oracleAddress)
        : 0
    );
  }

  watch(web3Account, setBondAllowance);

  async function propose() {
    loading.value = true;
    try {
      const tx = await moduleContract
        .connect(getInstance().web3.getSigner())
        .addProposal(proposal.id, transactionHashes);

      pendingCount.value++;
      await tx.wait();
      pendingCount.value--;

      await setState();
    } finally {
      loading.value = false;
    }
  }

  async function dispute(answer: boolean) {
    const answerBytesString = HashZero.replace(/.$/, answer ? '1' : '0');

    if (bondAddress) {
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
    } finally {
      loading.value = false;
    }
  }

  async function approveBond() {
    loading.value = true;

    try {
      const tx = await bondContract
        .connect(getInstance().web3.getSigner())
        .approve(oracleAddress, bondNextAmount.value);

      pendingCount.value++;
      await tx.wait();
      pendingCount.value--;
    } finally {
      loading.value = false;
    }
  }

  async function execute() {
    if (
      nextTransactionToExecute.value === -1 ||
      nextTransactionToExecute.value >= transactionHashes.length
    )
      return;

    const batch = executionData.batches[nextTransactionToExecute.value];
    const multisendTransaction = convertBatchToMultisendTransaction(
      batch.map(tx => convertToExecutableTransaction(tx)),
      executionData.safe.network
    );

    loading.value = true;
    try {
      const tx = await moduleContract
        .connect(getInstance().web3.getSigner())
        .executeProposalWithIndex(
          proposal.id,
          transactionHashes,
          multisendTransaction.to,
          multisendTransaction.value,
          multisendTransaction.data || '0x',
          multisendTransaction.operation,
          nextTransactionToExecute
        );

      pendingCount.value++;
      await tx.wait();
      pendingCount.value--;

      await setNextTransactionToExecute();
    } finally {
      loading.value = false;
    }
  }

  async function setNextTransactionToExecute(): Promise<void> {
    const transactionExecutionStates = await Promise.all(
      transactionHashes.map(hash =>
        moduleContract.executedProposalTransactions(questionHash, hash)
      )
    );

    nextTransactionToExecute.value = transactionExecutionStates.indexOf(false);
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
    } finally {
      loading.value = false;
    }
  }

  async function setBondData() {
    const events = await oracleContract.queryFilter(
      answersFilter,
      parseInt(proposal.snapshot)
    );

    // We need to send the information from last to first
    events.reverse();
    events.forEach(({ args }) => {
      if (!args) return;
      const { user, history_hash, bond, answer } = args;

      involvedUsers.value.push(user.toLowerCase());
      answerHistoryHashes.value.push(history_hash);
      placedBonds.value.push(bond);
      givenAnswers.value.push(answer);
    });

    const alreadyClaimed = BigNumber.from(currentHistoryHash).eq(0);

    // Check if current user has submitted an answer
    const currentUserAnswers = involvedUsers.value.map((user, i) => {
      if (user.toString() === web3Account.value.toLowerCase())
        return givenAnswers[i];
    });

    // If the user has answers, check if one of them is the winner
    const votedForCorrectQuestion =
      currentUserAnswers.some(answerBytes => answerBytes !== HashZero) &&
      isFinalized;

    // Remove the first history and add an empty one
    // More info: https://github.com/realitio/realitio-contracts/blob/master/truffle/contracts/Realitio.sol#L502
    answerHistoryHashes.value.shift();
    const firstHash =
      '0x0000000000000000000000000000000000000000000000000000000000000000';
    answerHistoryHashes.value.push(firstHash);
  }

  const executionState = computed<ExecutionState>(() => {
    if (now.value <= proposal.end) return ExecutionState.WAITING;

    return ExecutionState.PROPOSABLE;
  });

  return {
    loading,
    executionState,
    executionData,
    propose,
    dispute,
    execute,
    cooldown,
    bestAnswer,
    bondCurrentAmount,
    bondNextAmount,
    bondAllowance,
    bondSymbol,
    bondDecimals,
    approveBond,
    withdrawBondBalance,
    assignBondBalancesAndWithdraw,
    nextTransactionToExecute
  };
}
