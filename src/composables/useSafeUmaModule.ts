import { reactive, readonly, watch } from 'vue';
import UMA_MODULE_ABI from '@/helpers/abi/UMA_MODULE.json';
import UMA_ORACLE_ABI from '@/helpers/abi/UMA_ORACLE.json';
import ERC20_ABI from '@/helpers/abi/ERC20.json';
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
  call,
  multicall,
  sendTransaction
} from '@snapshot-labs/snapshot.js/src/utils';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { useWeb3, useTxStatus } from '@/composables';

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
  bondCollateralAddress: string | undefined;
  bondAmount: BigNumber;
  bondAllowance: BigNumber;
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
  const { web3Account } = useWeb3();
  const { pendingCount } = useTxStatus();

  const state = reactive<UmaModuleState>({
    loading: true,
    hasBeenProposed: false,
    hasBeenExecuted: false,
    canBeExecuted: false,
    hasBeenRejected: false,
    oracleAddress: undefined,
    timestamp: 0,
    resultState: UmaResultState.Invalid,
    bondCollateralAddress: undefined,
    bondAmount: BigNumber.from(0),
    bondAllowance: BigNumber.from(0)
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

    const [[timestamp], [optimisticOracle], [bondAmount], [collateralAddress]] =
      await multicall(
        executionData.safe.network,
        readProvider,
        UMA_MODULE_ABI,
        [
          [executionData.module.address, 'proposalHashes', [umaProposalHash]],
          [executionData.module.address, 'optimisticOracle', []],
          [executionData.module.address, 'bondAmount', []],
          [executionData.module.address, 'collateral', []]
        ]
      );

    state.timestamp = BigNumber.from(timestamp).toNumber();
    state.hasBeenProposed = !!state.timestamp;
    state.oracleAddress = optimisticOracle;
    state.bondAmount = bondAmount;
    state.bondCollateralAddress = collateralAddress;

    await setBondCollateralAllowance();

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

  async function setBondCollateralAllowance() {
    if (web3Account.value && state.bondCollateralAddress) {
      state.bondAllowance = await call(readProvider, ERC20_ABI, [
        state.bondCollateralAddress,
        'allowance',
        [web3Account.value, executionData.module.address]
      ]);
    }
  }

  watch(web3Account, setBondCollateralAllowance);

  async function approveBond() {
    if (!state.bondCollateralAddress) return;

    const tx = await sendTransaction(
      getInstance().web3,
      state.bondCollateralAddress,
      ERC20_ABI,
      'approve',
      [executionData.module.address, state.bondAmount]
    );
    pendingCount.value++;
    await tx.wait();
    pendingCount.value--;
  }

  async function proposeExecution() {
    const tx = await sendTransaction(
      getInstance().web3,
      executionData.module.address,
      UMA_MODULE_ABI,
      'proposeTransactions',
      [umaTransactions, proposalId]
    );
    pendingCount.value++;
    await tx.wait();
    pendingCount.value--;
  }

  async function disputeExecution() {
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
    pendingCount.value++;
    await tx.wait();
    pendingCount.value--;
  }

  async function execute() {
    const tx = await sendTransaction(
      getInstance().web3,
      executionData.module.address,
      UMA_MODULE_ABI,
      'executeProposal',
      [umaTransactions]
    );
    pendingCount.value++;
    await tx.wait();
    pendingCount.value--;
  }

  return {
    state: readonly(state),
    setState,
    approveBond,
    proposeExecution,
    disputeExecution,
    execute
  };
}
