import { computed, ref, watch } from 'vue';
import { useTimestamp } from '@vueuse/core';
import { defaultAbiCoder } from '@ethersproject/abi';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract, Event } from '@ethersproject/contracts';
import { keccak256 } from '@ethersproject/keccak256';
import { pack } from '@ethersproject/solidity';
import { toUtf8Bytes } from '@ethersproject/strings';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import UMA_MODULE_ABI from '@/helpers/abi/UMA_MODULE.json';
import UMA_ORACLE_ABI from '@/helpers/abi/UMA_ORACLE.json';
import ERC20_ABI from '@/helpers/abi/ERC20.json';
import { Proposal } from '@/helpers/interfaces';
import { Executor, ExecutionState, ModuleExecutionData } from '@/helpers/safe';
import { convertExecutionDataToModuleTransactions } from '@/helpers/transactionBuilder';
import { useWeb3, useTxStatus } from '@/composables';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { hexlify } from '@ethersproject/bytes';

// "ZODIAC"
const IDENTIFIER =
  '0x5a4f444941430000000000000000000000000000000000000000000000000000';

enum UmaOracleResultState {
  Invalid, // Never requested.
  Requested, // Requested, no other actions taken.
  Proposed, // Proposed, but not expired or disputed yet.
  Expired, // Proposed, not disputed, past liveness.
  Disputed, // Disputed, but no DVM price returned yet.
  Resolved, // Disputed and DVM price is available.
  Settled // Final price has been set in the contract (can get here from Expired or Resolved).
}

export async function useExecutorUma(
  executionDataIndex: number,
  executionData: ModuleExecutionData,
  proposal: Proposal
): Promise<Executor> {
  const now = computed(
    () => useTimestamp({ offset: 0, interval: 1000 }).value / 1000
  );
  const loading = ref<boolean>(false);
  const readProvider = getProvider(executionData.safe.network);
  const { web3Account } = useWeb3();
  const { pendingCount } = useTxStatus();

  const transactions = convertExecutionDataToModuleTransactions(executionData);
  const transactionsHash = keccak256(
    defaultAbiCoder.encode(
      ['(address to, uint8 operation, uint256 value, bytes data)[]'],
      [transactions]
    )
  );

  const explanation = `${proposal.id}${hexlify([executionDataIndex]).replace(
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

  const moduleContract = new Contract(
    executionData.module.address,
    UMA_MODULE_ABI,
    readProvider
  );

  const bondAllowance = ref<BigNumber>(BigNumber.from(0));
  const bondAmount = BigNumber.from(await moduleContract.bondAmount());
  const bondAddress = await moduleContract.collateral();
  const bondContract = new Contract(bondAddress, ERC20_ABI, readProvider);
  const bondSymbol = await bondContract.symbol();
  const bondDecimals = await bondContract.decimals();

  const oracleAddress = await moduleContract.optimisticOracle();
  const oracleContract = new Contract(
    oracleAddress,
    UMA_ORACLE_ABI,
    readProvider
  );

  const proposedAt = BigNumber.from(
    await moduleContract.proposalHashes(transactionsHash)
  ).toNumber();
  const disputeTimeout = BigNumber.from(
    await moduleContract.liveness()
  ).toNumber();

  const oracleState = ref<UmaOracleResultState>(UmaOracleResultState.Invalid);
  const oracleAnswer = ref<boolean>(true);

  const proposalEvents = ref<Event[]>([]);
  const executionEvents = ref<Event[]>([]);
  const executed = computed<boolean>(() => {
    return (
      executionEvents.value.length > 0 &&
      executionEvents.value.length ===
        proposalEvents.value.length * transactions.length
    );
  });

  async function setOracleState() {
    oracleState.value = await oracleContract.getState(
      executionData.module.address,
      IDENTIFIER,
      proposedAt,
      ancillaryData
    );

    const oracleRequest = await oracleContract.getRequest(
      executionData.module.address,
      IDENTIFIER,
      proposedAt,
      ancillaryData
    );

    oracleAnswer.value = BigNumber.from(oracleRequest.resolvedPrice).eq(1);
  }

  async function updateProposalExecutionHistory() {
    const allProposalEvents = await moduleContract.queryFilter(
      moduleContract.filters.TransactionsProposed()
      // parseInt(proposal.snapshot) // TODO: needs archive node
    );

    proposalEvents.value = allProposalEvents.filter(
      event =>
        event.args?.proposalHash === transactionsHash &&
        event.args?.explanation === explanation
    );

    executionEvents.value = await moduleContract.queryFilter(
      moduleContract.filters.TransactionExecuted(transactionsHash)
      // parseInt(proposal.snapshot) // TODO: needs archive node
    );
  }

  async function setCurrentUserBondAllowance() {
    bondAllowance.value = BigNumber.from(
      web3Account.value
        ? await bondContract.allowance(
            web3Account.value,
            executionData.module.address
          )
        : 0
    );
  }

  watch(web3Account, setCurrentUserBondAllowance);

  async function updateState() {
    loading.value = true;

    await setOracleState();
    await updateProposalExecutionHistory();
    await setCurrentUserBondAllowance();

    loading.value = false;
  }

  await updateState();

  async function approveBond() {
    loading.value = true;
    try {
      const tx = await bondContract
        .connect(getInstance().web3.getSigner())
        .approve(executionData.module.address, bondAmount);

      pendingCount.value++;
      await tx.wait(3);
      pendingCount.value--;

      await updateState();
    } finally {
      loading.value = false;
    }
  }

  async function propose() {
    loading.value = true;
    try {
      const tx = await moduleContract
        .connect(getInstance().web3.getSigner())
        .proposeTransactions(transactions, explanation);

      pendingCount.value++;
      await tx.wait(3);
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
          IDENTIFIER,
          proposedAt,
          ancillaryData
        );

      pendingCount.value++;
      await tx.wait(3);
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
      await tx.wait(3);
      pendingCount.value--;

      await updateState();
    } finally {
      loading.value = false;
    }
  }

  const executionState = computed<ExecutionState>(() => {
    if (now.value <= proposal.end) return ExecutionState.WAITING;

    if (executed.value) {
      return ExecutionState.EXECUTED;
    }

    if (
      UmaOracleResultState.Settled === oracleState.value &&
      !oracleAnswer.value
    ) {
      return ExecutionState.REJECTED;
    }

    if (UmaOracleResultState.Expired === oracleState.value) {
      return ExecutionState.EXECUTABLE;
    }

    if (UmaOracleResultState.Proposed === oracleState.value) {
      return ExecutionState.DISPUTABLE;
    }

    return ExecutionState.PROPOSABLE;
  });

  return {
    loading,
    executionState,
    propose,
    dispute,
    execute,
    now,
    bondAllowance,
    bondAmount,
    bondSymbol,
    bondDecimals,
    approveBond,
    proposedAt,
    disputeTimeout
  };
}
