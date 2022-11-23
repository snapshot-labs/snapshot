import { computed, ref } from 'vue';
import { _TypedDataEncoder } from '@ethersproject/hash';
import {
  convertExecutionDataToModuleTransactions,
  EIP712_SAFE_TRANSACTIN_TYPES,
  ModuleExecutionData,
  Transaction
} from '@/helpers/safe';
import REALITY_MODULE_ABI from '@/helpers/abi/REALITY_MODULE.json';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { keccak256 } from '@ethersproject/solidity';
import { Contract } from '@ethersproject/contracts';
import { Proposal } from '@/helpers/interfaces';
import { BigNumber } from '@ethersproject/bignumber';

function calcTransactionHash(
  chainId: string,
  verifyingContract: string,
  transaction: Transaction,
  nonce = '0'
) {
  const domain = { chainId, verifyingContract };

  return _TypedDataEncoder.hash(domain, EIP712_SAFE_TRANSACTIN_TYPES, {
    ...transaction,
    data: transaction.data || '0x',
    nonce
  });
}

export async function useExecutorRealityModule(
  executionData: ModuleExecutionData,
  proposal: Proposal
) {
  const readProvider = getProvider(executionData.safe.network);

  const moduleContract = new Contract(
    executionData.module.address,
    REALITY_MODULE_ABI,
    readProvider
  );

  const transactions = convertExecutionDataToModuleTransactions(executionData);
  const transactionHashes = transactions.map((transaction, nonce) =>
    calcTransactionHash(
      executionData.safe.network,
      executionData.module.address,
      transaction,
      nonce.toString()
    )
  );
  const transactionExecutionStates = ref<boolean[]>([]);
  const nextTransactionToExecute = computed<number | null>(() => {
    const transactionIndex = transactionExecutionStates.value.indexOf(false);
    return transactionIndex === -1 ? null : transactionIndex;
  });
  const allTransactionsExecuted = computed<boolean>(
    () =>
      transactionHashes.length > 0 && nextTransactionToExecute.value === null
  );

  const question = await moduleContract.buildQuestion(
    proposal.id,
    transactionHashes
  );
  const questionHash = keccak256(['string'], [question]);
  const questionId = await moduleContract.questionIds(questionHash);

  const cooldownPeriod = await moduleContract.questionCooldown();
  const expirationPeriod = await moduleContract.answerExpiration();
  const minimumBond = BigNumber.from(await moduleContract.minimumBond());

  async function updateTransactionExecutionStates(): Promise<void> {
    transactionExecutionStates.value = await Promise.all(
      transactionHashes.map(hash =>
        moduleContract.executedProposalTransactions(questionHash, hash)
      )
    );
  }

  return {
    moduleContract,
    transactions,
    transactionHashes,
    transactionExecutionStates,
    nextTransactionToExecute,
    allTransactionsExecuted,
    questionHash,
    questionId,
    cooldownPeriod,
    expirationPeriod,
    minimumBond,
    updateTransactionExecutionStates
  };
}
