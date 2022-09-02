import { reactive, readonly } from 'vue';
import { HashZero } from '@ethersproject/constants';
import { _TypedDataEncoder } from '@ethersproject/hash';
import {
  EIP712_SAFE_TRANSACTIN_TYPES,
  Executor,
  ExecutorState,
  ModuleExecutionData
} from '@/helpers/safe';
import {
  convertToRawTransaction,
  convertBatchToMultisendTransaction,
  RawTransaction
} from '@/helpers/transactionBuilder';
import {
  ERC20_ABI,
  REALITY_MODULE_ABI,
  REALITY_ORACLE_ABI
} from '@/helpers/abi';
import {
  call,
  multicall,
  sendTransaction
} from '@snapshot-labs/snapshot.js/src/utils';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { keccak256 } from '@ethersproject/solidity';
import { BigNumber } from '@ethersproject/bignumber';
import { useTimestamp } from '@vueuse/core';

interface RealityModuleState extends ExecutorState {
  oracleAddress: string | undefined;
  minimumBond: BigNumber | undefined;
  questionHash: string | undefined;
  questionId: string | undefined;
  finalizedAt: number | undefined;
  cooldown: number | undefined;
  nextTxIndex: number | undefined;
  expiration: number | undefined;
}

export function useSafeRealityModule(
  executionData: ModuleExecutionData,
  proposalId: string
): Executor<RealityModuleState> {
  const currentTimestamp = useTimestamp();
  const readProvider = getProvider(executionData.safe.network);

  const state = reactive<RealityModuleState>({
    loading: false,
    hasBeenProposed: false,
    hasBeenExecuted: false,
    canBeExecuted: false,
    oracleAddress: undefined,
    minimumBond: undefined,
    questionHash: undefined,
    questionId: undefined,
    questionResult: false,
    finalizedAt: undefined,
    cooldown: undefined,
    nextTxIndex: undefined,
    expiration: undefined
  });

  // TODO: add nonces
  const batchHashes = executionData.batches
    .map((batch, nonce) => {
      if (batch.length === 1) {
        return calcTransactionHash(
          convertToRawTransaction(batch[0]),
          nonce.toString()
        );
      } else if (batch.length > 1) {
        return calcTransactionHash(
          convertBatchToMultisendTransaction(
            batch.map(tx => convertToRawTransaction(tx)),
            executionData.safe.network
          )
        );
      }
      return '';
    })
    .filter(hash => hash !== '');

  function calcTransactionHash(transaction: RawTransaction, nonce = '0') {
    const domain = {
      chainId: executionData.safe.network,
      verifyingContract: executionData.module.address
    };

    return _TypedDataEncoder.hash(domain, EIP712_SAFE_TRANSACTIN_TYPES, {
      ...transaction,
      data: transaction.data || '0x',
      nonce
    });
  }

  async function setState() {
    state.loading = true;
    await setQuestionAndHash();
    await setProposalDetails();
    await setModuleDetails();
    await checkPossibleExecution();

    state.loading = false;
  }

  async function* proposeExecution() {
    const tx = await sendTransaction(
      getInstance().web3,
      executionData.module.address,
      REALITY_MODULE_ABI,
      'addProposal',
      [proposalId, batchHashes]
    );
    yield;
    await tx.wait();
  }

  async function* disputeExecution() {
    yield;
  }

  async function* execute() {
    yield;
  }

  async function setQuestionAndHash(): Promise<void> {
    const question = await call(readProvider, REALITY_MODULE_ABI, [
      executionData.module.address,
      'buildQuestion',
      [proposalId, batchHashes]
    ]);
    state.questionHash = keccak256(['string'], [question]);
  }

  async function setProposalDetails(): Promise<void> {
    const proposalInfo = (
      await multicall(
        executionData.safe.network,
        readProvider,
        REALITY_MODULE_ABI,
        [
          [executionData.module.address, 'questionIds', [state.questionHash]]
        ].concat(
          batchHashes.map(txHash => [
            executionData.module.address,
            'executedProposalTransactions',
            [state.questionHash, txHash]
          ])
        )
      )
    ).map(res => res[0]);

    // We need to offset the index by -1 the first element is the questionId
    const nextIndexToExecute = proposalInfo.indexOf(false, 1) - 1;

    state.questionId =
      proposalInfo[0] !== HashZero ? proposalInfo[0] : undefined;
    state.nextTxIndex =
      nextIndexToExecute < 0 || nextIndexToExecute >= batchHashes.length
        ? undefined
        : nextIndexToExecute;
  }

  async function setModuleDetails(): Promise<void> {
    const moduleDetails = await multicall(
      executionData.safe.network,
      readProvider,
      REALITY_MODULE_ABI,
      [
        [executionData.module.address, 'avatar'],
        [executionData.module.address, 'oracle'],
        [executionData.module.address, 'questionCooldown'],
        [executionData.module.address, 'minimumBond'],
        [executionData.module.address, 'answerExpiration']
      ]
    );

    state.oracleAddress = moduleDetails[1][0];
    state.cooldown = moduleDetails[2][0];
    state.minimumBond = moduleDetails[3][0];
    state.expiration = moduleDetails[4][0];
  }

  async function checkPossibleExecution(): Promise<void> {
    if (state.questionId) {
      try {
        state.finalizedAt = (await call(readProvider, REALITY_ORACLE_ABI, [
          state.oracleAddress,
          'getFinalizeTS',
          [state.questionId]
        ])) as number;

        if (state.finalizedAt > 0) {
          state.questionResult = BigNumber.from(
            await call(readProvider, REALITY_ORACLE_ABI, [
              state.oracleAddress,
              'resultFor',
              [state.questionId]
            ])
          ).eq(BigNumber.from(1));
        }

        state.canBeExecuted = !!(state.questionResult &&
          state.finalizedAt + Number(state.cooldown) < currentTimestamp.value,
        state.finalizedAt + Number(state.expiration) > currentTimestamp.value);
      } catch (e) {
        state.finalizedAt = undefined;
        state.canBeExecuted = false;
      }
    } else {
      state.finalizedAt = undefined;
      state.canBeExecuted = false;
    }
  }

  async function* setOracleAnswer(answer: '1' | '0') {
    if (!getInstance().web3 || !state.oracleAddress) return;

    const currentBond = await call(readProvider, REALITY_ORACLE_ABI, [
      state.oracleAddress,
      'getBond',
      [state.questionId]
    ]);

    let bond;
    let methodName;
    const txOverrides = {};
    let parameters = [state.questionId, HashZero.replace(/.$/, answer)];

    const currentBondIsZero = currentBond.eq(BigNumber.from(0));
    if (currentBondIsZero) {
      // DaoModules can have 0 minimumBond, if it happens, the initial bond will be 1 token
      const daoBondIsZero = BigNumber.from(state.minimumBond).eq(0);
      bond = daoBondIsZero ? BigNumber.from(10) : state.minimumBond;
    } else {
      bond = currentBond.mul(2);
    }

    // fetch token attribute from Realitio contract, if it works, it means it is
    // a RealitioERC20, otherwise the catch will handle the currency as ETH
    try {
      const account = (await getInstance().web3.listAccounts())[0];
      const token = await call(readProvider, REALITY_ORACLE_ABI, [
        state.oracleAddress,
        'token',
        []
      ]);
      const [[tokenDecimals], [allowance]] = await multicall(
        executionData.safe.network,
        readProvider,
        ERC20_ABI,
        [
          [token, 'decimals', []],
          [token, 'allowance', [account, state.oracleAddress]]
        ]
      );

      if (bond.eq(10)) {
        bond = bond.pow(tokenDecimals);
      }

      // Check if contract has allowance on user tokens,
      // if not, trigger approve method
      if (allowance.lt(bond)) {
        const approveTx = await sendTransaction(
          getInstance().web3,
          token,
          ERC20_ABI,
          'approve',
          [state.oracleAddress, bond],
          {}
        );
        yield 'erc20-approval';
        const approvalReceipt = await approveTx.wait();
        console.log('[DAO module] token transfer approved:', approvalReceipt);
        yield;
      }
      parameters = [...parameters, bond, bond];
      methodName = 'submitAnswerERC20';
    } catch (e) {
      if (bond.eq(10)) {
        bond = bond.pow(18);
      }
      parameters = [...parameters, bond];
      txOverrides['value'] = bond.toString();
      methodName = 'submitAnswer';
    }

    const tx = await sendTransaction(
      getInstance().web3,
      state.oracleAddress,
      REALITY_ORACLE_ABI,
      methodName,
      parameters,
      txOverrides
    );
    yield;
    const receipt = await tx.wait();
    console.log('[DAO module] executed vote on oracle:', receipt);
  }

  return {
    state: readonly(state) as RealityModuleState,
    setState,
    proposeExecution,
    disputeExecution,
    execute,
    setOracleAnswer
  };
}
