import { computed, ref, watch } from 'vue';
import { useTimestamp } from '@vueuse/core';
import { defaultAbiCoder } from '@ethersproject/abi';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { keccak256 } from '@ethersproject/keccak256';
import { pack } from '@ethersproject/solidity';
import { toUtf8Bytes } from '@ethersproject/strings';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import UMA_MODULE_ABI from '@/helpers/abi/UMA_MODULE.json';
import UMA_ORACLE_ABI from '@/helpers/abi/UMA_ORACLE.json';
import ERC20_ABI from '@/helpers/abi/ERC20.json';
import { Proposal } from '@/helpers/interfaces';
import { Executor, ExecutionState, ModuleExecutionData } from '@/helpers/safe';
import {
  convertToExecutableTransaction,
  convertBatchToMultisendTransaction,
  ExecutableTransaction
} from '@/helpers/transactionBuilder';
import { useWeb3, useTxStatus } from '@/composables';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';

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

function convertExecutionDataToUmaTransactions(
  executionData: ModuleExecutionData
): ExecutableTransaction[] {
  return executionData.batches
    .map(batch => {
      if (batch.length === 1) {
        return convertToExecutableTransaction(batch[0]);
      } else if (batch.length > 1) {
        return convertBatchToMultisendTransaction(
          batch.map(transaction => convertToExecutableTransaction(transaction)),
          executionData.safe.network
        );
      }
      return null;
    })
    .filter(transaction => transaction !== null) as ExecutableTransaction[];
}

export async function useExecutorUma(
  executionData: ModuleExecutionData,
  proposal: Proposal
): Promise<Executor> {
  const now = useTimestamp({ offset: 0 });
  const loading = ref<boolean>(false);
  const readProvider = getProvider(executionData.safe.network);
  const { web3Account } = useWeb3();
  const { pendingCount } = useTxStatus();

  const transactions = convertExecutionDataToUmaTransactions(executionData);
  const transactionsHash = keccak256(
    defaultAbiCoder.encode(
      ['(address to, uint8 operation, uint256 value, bytes data)[]'],
      [transactions]
    )
  );
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

  const oracleState = ref<UmaOracleResultState>(UmaOracleResultState.Invalid);
  const oracleAnswer = ref<boolean>(true);

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

  async function setBondAllowance() {
    bondAllowance.value = BigNumber.from(
      web3Account.value
        ? await bondContract.allowance(
            web3Account.value,
            executionData.module.address
          )
        : 0
    );
  }

  watch(web3Account, setBondAllowance);

  async function approveBond() {
    loading.value = true;
    try {
      const tx = await bondContract
        .connect(getInstance().web3.getSigner())
        .approve(executionData.module.address, bondAmount);

      pendingCount.value++;
      await tx.wait();
      pendingCount.value--;
    } finally {
      loading.value = false;
    }
  }

  async function propose() {
    loading.value = true;
    try {
      const tx = await moduleContract
        .connect(getInstance().web3.getSigner())
        .proposeTransactions(transactions, proposal.id);

      pendingCount.value++;
      await tx.wait();
      pendingCount.value--;

      await setOracleState();
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
      await tx.wait();
      pendingCount.value--;

      await setOracleState();
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
      await tx.wait();
      pendingCount.value--;

      await setOracleState();
    } finally {
      loading.value = false;
    }
  }

  const executionState = computed<ExecutionState>(() => {
    if (now.value <= proposal.end) return ExecutionState.WAITING;

    if (UmaOracleResultState.Settled === oracleState.value) {
      if (oracleAnswer.value) {
        return ExecutionState.EXECUTED;
      }
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
    executionData,
    propose,
    dispute,
    execute,
    bondAllowance,
    bondAmount,
    bondSymbol,
    bondDecimals,
    approveBond
  };
}
