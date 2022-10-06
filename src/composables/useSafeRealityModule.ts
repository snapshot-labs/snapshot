import { reactive, readonly } from 'vue';
import { Result } from '@ethersproject/abi';
import { HashZero } from '@ethersproject/constants';
import { _TypedDataEncoder } from '@ethersproject/hash';
import {
  EIP712_SAFE_TRANSACTIN_TYPES,
  Executor,
  ExecutorState,
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
import REALITY_ORACLE_ABI from '@/helpers/abi/REALITY_ORACLE.json';
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
import { Contract } from '@ethersproject/contracts';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { useTxStatus, useWeb3 } from '@/composables';

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
  proposalId: string,
  proposalSnapshot: string
): Executor<RealityModuleState> {
  const currentTimestamp = useTimestamp();
  const readProvider = getProvider(executionData.safe.network);
  const { pendingCount } = useTxStatus();
  const { web3Account } = useWeb3();

  const state = reactive<RealityModuleState>({
    loading: false,
    hasBeenProposed: false,
    hasBeenExecuted: false,
    canBeExecuted: false,
    hasBeenRejected: false,
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
  const finalTxHashes = executionData.batches
    .map((batch, nonce) => {
      if (batch.length === 1) {
        return calcTransactionHash(
          convertToExecutableTransaction(batch[0]),
          nonce.toString()
        );
      } else if (batch.length > 1) {
        return calcTransactionHash(
          convertBatchToMultisendTransaction(
            batch.map(tx => convertToExecutableTransaction(tx)),
            executionData.safe.network
          )
        );
      }
      return '';
    })
    .filter(hash => hash !== '');

  function calcTransactionHash(
    transaction: ExecutableTransaction,
    nonce = '0'
  ) {
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
    await setBondData();
    await checkPossibleExecution();

    state.loading = false;
  }

  async function proposeExecution() {
    const tx = await sendTransaction(
      getInstance().web3,
      executionData.module.address,
      REALITY_MODULE_ABI,
      'addProposal',
      [proposalId, finalTxHashes]
    );
    pendingCount.value++;
    await tx.wait();
    pendingCount.value--;
  }

  async function disputeExecution(answer: '0' | '1') {
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
          [token, 'allowance', [web3Account.value, state.oracleAddress]]
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
        pendingCount.value++;
        const approvalReceipt = await approveTx.wait();
        pendingCount.value--;
        console.log('[DAO module] token transfer approved:', approvalReceipt);
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
    pendingCount.value++;
    const receipt = await tx.wait();
    pendingCount.value--;
    console.log('[DAO module] executed vote on oracle:', receipt);
  }

  async function execute() {
    if (state.nextTxIndex === undefined) return;

    const batch = executionData.batches[state.nextTxIndex];
    const multisendTransaction = convertBatchToMultisendTransaction(
      batch.map(tx => convertToExecutableTransaction(tx)),
      executionData.safe.network
    );
    const tx = await sendTransaction(
      getInstance().web3,
      executionData.module.address,
      REALITY_MODULE_ABI,
      'executeProposalWithIndex',
      [
        proposalId,
        finalTxHashes,
        multisendTransaction.to,
        multisendTransaction.value,
        multisendTransaction.data || '0x',
        multisendTransaction.operation,
        state.nextTxIndex
      ]
    );
    pendingCount.value++;
    await tx.wait();
    pendingCount.value--;

    if (executionData.batches.length > state.nextTxIndex + 1) {
      state.nextTxIndex++;
    }
  }

  async function setQuestionAndHash(): Promise<void> {
    const question = await call(readProvider, REALITY_MODULE_ABI, [
      executionData.module.address,
      'buildQuestion',
      [proposalId, finalTxHashes]
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
          finalTxHashes.map(txHash => [
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
      nextIndexToExecute < 0 || nextIndexToExecute >= finalTxHashes.length
        ? undefined
        : nextIndexToExecute;

    if (state.questionId) {
      state.hasBeenProposed = true;
    }
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
        state.hasBeenRejected = !state.questionResult && state.finalizedAt > 0;
      } catch (e) {
        state.finalizedAt = undefined;
        state.canBeExecuted = false;
        state.hasBeenRejected = false;
      }
    } else {
      state.finalizedAt = undefined;
      state.canBeExecuted = false;
      state.hasBeenRejected = false;
    }
  }

  async function setQuestionInfoFromOracle(): Promise<{
    currentBond: BigNumber | undefined;
    isApproved: boolean;
    endTime: number | undefined;
  }> {
    if (state.questionId) {
      const provider: StaticJsonRpcProvider = getProvider(
        executionData.safe.network
      );
      const result = await multicall(
        executionData.safe.network,
        provider,
        REALITY_ORACLE_ABI,
        [
          [state.oracleAddress, 'getFinalizeTS', [state.questionId]],
          [state.oracleAddress, 'getBond', [state.questionId]],
          [state.oracleAddress, 'getBestAnswer', [state.questionId]]
        ]
      );

      const currentBond = BigNumber.from(result[1][0]);
      const answer = BigNumber.from(result[2][0]);

      return {
        currentBond,
        isApproved: answer.eq(BigNumber.from(1)),
        endTime: BigNumber.from(result[0][0]).toNumber()
      };
    }
    return {
      currentBond: undefined,
      isApproved: false,
      endTime: undefined
    };
  }

  async function claimBond(
    claimParams: [string[], string[], number[], string[]]
  ) {
    if (!getInstance().web3 || !state.oracleAddress) return;

    const currentHistoryHash = await call(
      getInstance().web3,
      REALITY_ORACLE_ABI,
      [state.oracleAddress, 'getHistoryHash', [state.questionId]]
    );

    if (BigNumber.from(currentHistoryHash).eq(0)) {
      const withdrawTx = await sendTransaction(
        getInstance().web3,
        state.oracleAddress,
        REALITY_ORACLE_ABI,
        'withdraw',
        []
      );
      pendingCount.value++;
      await withdrawTx.wait();
      pendingCount.value--;
      return;
    }

    const tx = await sendTransaction(
      getInstance().web3,
      state.oracleAddress,
      REALITY_ORACLE_ABI,
      'claimMultipleAndWithdrawBalance',
      [[state.questionId], ...claimParams]
    );
    pendingCount.value++;
    await tx.wait();
    pendingCount.value--;
  }

  async function setBondData() {
    if (!getInstance().web3 || !state.oracleAddress || !state.questionId)
      return;

    const contract = new Contract(
      state.oracleAddress,
      REALITY_ORACLE_ABI,
      getInstance().web3
    );

    const [[userBalance], [bestAnswer], [historyHash], [isFinalized]] =
      await multicall(
        executionData.safe.network,
        readProvider,
        REALITY_ORACLE_ABI,
        [
          [state.oracleAddress, 'balanceOf', [web3Account.value]],
          [state.oracleAddress, 'getBestAnswer', [state.questionId]],
          [state.oracleAddress, 'getHistoryHash', [state.questionId]],
          [state.oracleAddress, 'isFinalized', [state.questionId]]
        ]
      );

    const nativeToken = getNativeCoinInfo(executionData.safe.network);
    let token = {
      symbol: nativeToken.symbol,
      decimals: nativeToken.decimals
    };

    try {
      const tokenCall = await call(readProvider, REALITY_ORACLE_ABI, [
        state.oracleAddress,
        'token',
        []
      ]);
      const [[symbol], [decimals]] = await multicall(
        executionData.safe.network,
        readProvider,
        ERC20_ABI,
        [
          [tokenCall, 'symbol', []],
          [tokenCall, 'decimals', []]
        ]
      );

      token = {
        symbol,
        decimals
      };
    } catch (e) {
      console.log('[Realitio] Info: Oracle is not ERC20 based.');
    }

    const answersFilter = contract.filters.LogNewAnswer(null, state.questionId);
    const events = await contract.queryFilter(
      answersFilter,
      parseInt(proposalSnapshot)
    );

    const users: Result[] = [];
    const historyHashes: Result[] = [];
    const bonds: Result[] = [];
    const answers: Result[] = [];

    // We need to send the information from last to first
    events.reverse();
    events.forEach(({ args }) => {
      users.push(args?.user.toLowerCase());
      historyHashes.push(args?.history_hash);
      bonds.push(args?.bond);
      answers.push(args?.answer);
    });

    const alreadyClaimed = BigNumber.from(historyHash).eq(0);

    // Check if current user has submitted an answer
    const currentUserAnswers = users.map((user, i) => {
      if (user.toString() === web3Account.value.toLowerCase())
        return answers[i];
    });

    // If the user has answers, check if one of them is the winner
    const votedForCorrectQuestion =
      currentUserAnswers.some(answer => {
        if (answer) {
          return BigNumber.from(answer).eq(bestAnswer);
        }
      }) && isFinalized;

    // If user has balance in the contract, he should be able to withdraw
    const hasBalance = !userBalance.eq(0) && isFinalized;

    // Remove the first history and add an empty one
    // More info: https://github.com/realitio/realitio-contracts/blob/master/truffle/contracts/Realitio.sol#L502
    historyHashes.shift();
    const firstHash =
      '0x0000000000000000000000000000000000000000000000000000000000000000' as unknown;
    historyHashes.push(firstHash as Result);

    return {
      tokenSymbol: token.symbol,
      tokenDecimals: token.decimals,
      canClaim: (!alreadyClaimed && votedForCorrectQuestion) || hasBalance,
      data: {
        length: [bonds.length.toString()],
        historyHashes,
        users,
        bonds,
        answers
      }
    };
  }

  return {
    state: readonly(state) as RealityModuleState,
    setState,
    proposeExecution,
    disputeExecution,
    execute,
    claimBond
  };
}
