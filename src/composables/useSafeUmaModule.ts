import UMA_MODULE_ABI from '@/helpers/abi/UMA_MODULE.json';
import UMA_ORACLE_ABI from '@/helpers/abi/UMA_ORACLE.json';
import {
  ExecutionData,
  Executor,
  ExecutorState,
  ModuleExecutionData
} from '@/helpers/safe';
import {
  convertToExecutableTransaction,
  convertBatchToMultisendTransaction,
  ExecutableTransaction
} from '@/helpers/transactionBuilder';
import { defaultAbiCoder } from '@ethersproject/abi';
import { BigNumber } from '@ethersproject/bignumber';
import { keccak256 } from '@ethersproject/keccak256';
import { pack } from '@ethersproject/solidity';
import { toUtf8Bytes } from '@ethersproject/strings';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import {
  multicall,
  sendTransaction
} from '@snapshot-labs/snapshot.js/src/utils';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { reactive, readonly } from 'vue';

// "ZODIAC"
const IDENTIFIER =
  '0x5a4f444941430000000000000000000000000000000000000000000000000000';

enum UmaResultState {
  Invalid, // Never requested.
  Requested, // Requested, no other actions taken.
  Proposed, // Proposed, but not expired or disputed yet.
  Expired, // Proposed, not disputed, past liveness.
  Disputed, // Disputed, but no DVM price returned yet.
  Resolved, // Disputed and DVM price is available.
  Settled // Final price has been set in the contract (can get here from Expired or Resolved).
}

interface UmaModuleState extends ExecutorState {
  oracleAddress: string | undefined;
  timestamp: number;
  resultState: UmaResultState;
}

function convertExecutionDataToUmaTransactions(
  executionData: ExecutionData
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

export function useSafeUmaModule(
  executionData: ModuleExecutionData,
  proposalId: string
): Executor<UmaModuleState> {
  const readProvider = getProvider(executionData.safe.network);

  const state = reactive<UmaModuleState>({
    loading: true,
    hasBeenProposed: false,
    hasBeenExecuted: false,
    canBeExecuted: false,
    hasBeenRejected: false,
    oracleAddress: undefined,
    timestamp: 0,
    resultState: UmaResultState.Invalid
  });

  const umaTransactions = convertExecutionDataToUmaTransactions(executionData);

  const umaProposalHash = keccak256(
    defaultAbiCoder.encode(
      ['(address to, uint8 operation, uint256 value, bytes data)[]'],
      [umaTransactions]
    )
  );

  const umaAncillaryData = pack(
    ['string', 'bytes', 'bytes'],
    [
      '',
      pack(['string', 'string'], ['proposalHash', ':']),
      toUtf8Bytes(umaProposalHash.replace('0x', ''))
    ]
  );

  async function setState() {
    state.loading = true;

    const [[timestamp], [optimisticOracle]] = await multicall(
      executionData.safe.network,
      readProvider,
      UMA_MODULE_ABI,
      [
        [executionData.module.address, 'proposalHashes', [umaProposalHash]],
        [executionData.module.address, 'optimisticOracle', []]
      ]
    );

    state.timestamp = BigNumber.from(timestamp).toNumber();
    state.hasBeenProposed = !!state.timestamp;
    state.oracleAddress = optimisticOracle;

    const [[umaResultState]] = await multicall(
      executionData.safe.network,
      readProvider,
      UMA_ORACLE_ABI,
      [
        [
          state.oracleAddress,
          'getState',
          [
            executionData.module.address,
            IDENTIFIER,
            state.timestamp,
            umaAncillaryData
          ]
        ]
      ]
    );

    state.hasBeenProposed = umaResultState !== UmaResultState.Invalid;
    state.canBeExecuted = umaResultState === UmaResultState.Expired;
    state.loading = false;
  }

  async function* proposeExecution() {
    const tx = await sendTransaction(
      getInstance().web3,
      executionData.module.address,
      UMA_MODULE_ABI,
      'proposeTransactions',
      [umaTransactions, proposalId]
    );
    yield;
    await tx.wait();
  }

  async function* disputeExecution() {
    if (!state.oracleAddress || !state.timestamp) return;

    const tx = await sendTransaction(
      getInstance().web3,
      state.oracleAddress,
      UMA_ORACLE_ABI,
      'disputePrice',
      [
        executionData.module.address,
        IDENTIFIER,
        state.timestamp,
        umaAncillaryData
      ]
    );
    yield;
    await tx.wait();
  }

  async function* execute() {
    const tx = await sendTransaction(
      getInstance().web3,
      executionData.module.address,
      UMA_MODULE_ABI,
      'executeProposal',
      [umaTransactions]
    );
    yield;
    await tx.wait();
  }

  return {
    state: readonly(state),
    setState,
    proposeExecution,
    disputeExecution,
    execute
  };
}
