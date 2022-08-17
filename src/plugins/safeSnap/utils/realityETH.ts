import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import { multicall } from '@snapshot-labs/snapshot.js/src/utils';
import { REALITY_ORACLE_ABI } from '../constants';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';

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
