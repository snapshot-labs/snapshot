import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { multicall } from '@snapshot-labs/snapshot.js/src/utils';
import { REALITY_MODULE_ABI, REALITY_ORACLE_ABI } from '../constants';
import { HashZero } from '@ethersproject/constants';
import { BigNumber } from '@ethersproject/bignumber';
import { keccak256 as solidityKeccak256 } from '@ethersproject/solidity';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';

export const buildQuestion = async (proposalId: string, txHashes: string[]) => {
  const hashesHash = solidityKeccak256(['bytes32[]'], [txHashes]).slice(2);
  return `${proposalId}␟${hashesHash}`;
};

export const getProposalDetails = async (
  network: string,
  moduleAddress: string,
  questionHash: string,
  txHashes: string[]
): Promise<{ questionId: string; nextTxIndex: number | undefined }> => {
  const provider: StaticJsonRpcProvider = getProvider(network);
  const proposalInfo = (
    await multicall(
      network,
      provider,
      REALITY_MODULE_ABI,
      [[moduleAddress, 'questionIds', [questionHash]]].concat(
        txHashes.map(txHash => [
          moduleAddress,
          'executedProposalTransactions',
          [questionHash, txHash]
        ])
      )
    )
  ).map(res => res[0]);
  const questionId = proposalInfo[0];
  // We need to offset the index by -1 the first element is the questionId
  const nextIndexToExecute = proposalInfo.indexOf(false, 1) - 1;
  return {
    questionId: questionId !== HashZero ? questionId : undefined,
    nextTxIndex:
      nextIndexToExecute < 0 || nextIndexToExecute >= txHashes.length
        ? undefined
        : nextIndexToExecute
  };
};

export const getModuleDetails = async (
  network: string,
  moduleAddress: string
): Promise<{
  dao: string;
  oracle: string;
  cooldown: number;
  minimumBond: number;
  expiration: number;
}> => {
  const provider: StaticJsonRpcProvider = getProvider(network);
  let moduleDetails;
  try {
    // Assume module is Reality Module
    moduleDetails = await multicall(network, provider, REALITY_MODULE_ABI, [
      [moduleAddress, 'avatar'],
      [moduleAddress, 'oracle'],
      [moduleAddress, 'questionCooldown'],
      [moduleAddress, 'minimumBond'],
      [moduleAddress, 'answerExpiration']
    ]);
  } catch (err) {
    // The Reality Module doesn't have an avatar field, causing tx to fails.
    // Assume module is Dao Module (old version)
    moduleDetails = await multicall(network, provider, REALITY_MODULE_ABI, [
      [moduleAddress, 'executor'],
      [moduleAddress, 'oracle'],
      [moduleAddress, 'questionCooldown'],
      [moduleAddress, 'minimumBond'],
      [moduleAddress, 'answerExpiration']
    ]);
  }

  return {
    dao: moduleDetails[0][0],
    oracle: moduleDetails[1][0],
    cooldown: moduleDetails[2][0],
    minimumBond: moduleDetails[3][0],
    expiration: moduleDetails[4][0]
  };
};

export const retrieveInfoFromOracle = async (
  network: string,
  oracleAddress: string,
  questionId: string | undefined
): Promise<{
  currentBond: BigNumber | undefined;
  isApproved: boolean;
  endTime: number | undefined;
}> => {
  if (questionId) {
    const provider: StaticJsonRpcProvider = getProvider(network);
    const result = await multicall(network, provider, REALITY_ORACLE_ABI, [
      [oracleAddress, 'getFinalizeTS', [questionId]],
      [oracleAddress, 'getBond', [questionId]],
      [oracleAddress, 'getBestAnswer', [questionId]]
    ]);

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
};

export const checkPossibleExecution = async (
  network: string,
  oracleAddress: string,
  questionId: string | undefined
): Promise<{
  executionApproved: boolean;
  finalizedAt: number | undefined;
}> => {
  if (questionId) {
    const provider: StaticJsonRpcProvider = getProvider(network);
    try {
      const result = await multicall(network, provider, REALITY_ORACLE_ABI, [
        [oracleAddress, 'resultFor', [questionId]],
        [oracleAddress, 'getFinalizeTS', [questionId]]
      ]);

      return {
        executionApproved: BigNumber.from(result[0][0]).eq(BigNumber.from(1)),
        finalizedAt: BigNumber.from(result[1][0]).toNumber()
      };
    } catch (e) {
      // We expect an error while the question is not answered yet
    }
  }
  return {
    executionApproved: false,
    finalizedAt: undefined
  };
};
