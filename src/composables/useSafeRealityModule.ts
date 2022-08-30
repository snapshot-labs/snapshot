import { readonly, ref } from 'vue';
import { HashZero } from '@ethersproject/constants';
import { _TypedDataEncoder } from '@ethersproject/hash';
import { EIP712_TYPES, ModuleExecutionData } from '@/helpers/safe';
import {
  createMultiSendTx,
  getMultiSendAddress,
  Transaction
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

export function useSafeRealityModule(
  executionData: ModuleExecutionData,
  proposalId: string
) {
  const readProvider = getProvider(executionData.safe.network);
  let questionHash = '';
  let oracleAddress!: string;
  let minimumBond: number | undefined = undefined;

  const questionId = ref<string>('');
  const finalizedAt = ref<number | undefined>(undefined);
  const cooldown = ref<number | undefined>(undefined);
  const executionApproved = ref<boolean>(false);
  const nextTxIndex = ref<number | undefined>(undefined);
  const expiration = ref<number | undefined>(undefined);

  const batchHashes = executionData.batches
    .map((batch, nonce) => {
      if (batch.length === 1) {
        return calcTransactionHash(batch[0], nonce.toString());
      } else if (batch.length > 1) {
        return calcTransactionHash(
          createMultiSendTx(
            batch,
            nonce.toString(),
            getMultiSendAddress(executionData.safe.network)
          )
        );
      }
      return '';
    })
    .filter(hash => hash !== '');

  function calcTransactionHash(transaction: Transaction, nonce = '0') {
    const domain = {
      chainId: executionData.safe.network,
      verifyingContract: executionData.module.address
    };

    return _TypedDataEncoder.hash(domain, EIP712_TYPES, {
      ...transaction,
      data: transaction.data || '0x',
      nonce
    });
  }

  async function* proposeTransactions() {
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

  async function* disputeTransactions() {
    yield;
  }

  async function* executeTransactions() {
    yield;
  }

  async function setQuestion(): Promise<void> {
    const question = await call(readProvider, REALITY_MODULE_ABI, [
      executionData.module.address,
      'buildQuestion',
      [proposalId, batchHashes]
    ]);
    questionHash = keccak256(['string'], [question]);
    questionId.value = await call(readProvider, REALITY_MODULE_ABI, [
      executionData.module.address,
      'getQuestionId',
      [question, 0]
    ]);
  }

  async function setProposalDetails(): Promise<void> {
    const proposalInfo = (
      await multicall(
        executionData.safe.network,
        readProvider,
        REALITY_MODULE_ABI,
        [[executionData.module.address, 'questionIds', [questionHash]]].concat(
          batchHashes.map(txHash => [
            executionData.module.address,
            'executedProposalTransactions',
            [questionHash, txHash]
          ])
        )
      )
    ).map(res => res[0]);

    // We need to offset the index by -1 the first element is the questionId
    const nextIndexToExecute = proposalInfo.indexOf(false, 1) - 1;

    questionId.value =
      proposalInfo[0] !== HashZero ? proposalInfo[0] : undefined;
    nextTxIndex.value =
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

    oracleAddress = moduleDetails[1][0];
    cooldown.value = moduleDetails[2][0];
    minimumBond = moduleDetails[3][0];
    expiration.value = moduleDetails[4][0];
  }

  async function checkPossibleExecution(): Promise<void> {
    if (questionId.value) {
      try {
        const result = await multicall(
          executionData.safe.network,
          readProvider,
          REALITY_ORACLE_ABI,
          [
            [oracleAddress, 'resultFor', [questionId.value]],
            [oracleAddress, 'getFinalizeTS', [questionId.value]]
          ]
        );

        executionApproved.value = BigNumber.from(result[0][0]).eq(
          BigNumber.from(1)
        );
        finalizedAt.value = BigNumber.from(result[1][0]).toNumber();
      } catch (e) {
        console.log('Question is not answered yet.', e);
      }
    } else {
      executionApproved.value = false;
      finalizedAt.value = undefined;
    }
  }

  async function* setOracleAnswer(answer: '1' | '0') {
    if (!getInstance().web3) return;

    const currentBond = await call(readProvider, REALITY_ORACLE_ABI, [
      oracleAddress,
      'getBond',
      [questionId.value]
    ]);

    let bond;
    let methodName;
    const txOverrides = {};
    let parameters = [questionId.value, HashZero.replace(/.$/, answer)];

    const currentBondIsZero = currentBond.eq(BigNumber.from(0));
    if (currentBondIsZero) {
      // DaoModules can have 0 minimumBond, if it happens, the initial bond will be 1 token
      const daoBondIsZero = BigNumber.from(minimumBond).eq(0);
      bond = daoBondIsZero ? BigNumber.from(10) : minimumBond;
    } else {
      bond = currentBond.mul(2);
    }

    // fetch token attribute from Realitio contract, if it works, it means it is
    // a RealitioERC20, otherwise the catch will handle the currency as ETH
    try {
      const account = (await getInstance().web3.listAccounts())[0];
      const token = await call(readProvider, REALITY_ORACLE_ABI, [
        oracleAddress,
        'token',
        []
      ]);
      const [[tokenDecimals], [allowance]] = await multicall(
        executionData.safe.network,
        readProvider,
        ERC20_ABI,
        [
          [token, 'decimals', []],
          [token, 'allowance', [account, oracleAddress]]
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
          [oracleAddress, bond],
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
      oracleAddress,
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
    finalizedAt: readonly(finalizedAt),
    questionId: readonly(questionId),
    cooldown: readonly(cooldown),
    executionApproved: readonly(executionApproved),
    nextTxIndex: readonly(nextTxIndex),
    expiration: readonly(expiration),
    proposeTransactions,
    disputeTransactions,
    executeTransactions,
    setQuestion,
    setProposalDetails,
    setModuleDetails,
    checkPossibleExecution,
    setOracleAnswer
  };
}
