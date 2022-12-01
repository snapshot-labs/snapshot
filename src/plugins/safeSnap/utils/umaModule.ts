import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { multicall } from '@snapshot-labs/snapshot.js/src/utils';
import { UMA_MODULE_ABI } from '../constants';

export const getModuleDetails = async (
  provider: StaticJsonRpcProvider,
  network: string,
  moduleAddress: string
): Promise<{
  dao: string;
  oracle: string;
  rules: string;
  minimumBond: number;
  expiration: number;
}> => {
  const moduleDetails = await multicall(network, provider, UMA_MODULE_ABI, [
    [moduleAddress, 'avatar'],
    [moduleAddress, 'optimisticOracle'],
    [moduleAddress, 'rules'],
    [moduleAddress, 'bondAmount'],
    [moduleAddress, 'liveness']
  ]);
  return {
    dao: moduleDetails[0][0],
    oracle: moduleDetails[1][0],
    rules: moduleDetails[2][0],
    minimumBond: moduleDetails[3][0],
    expiration: moduleDetails[4][0]
  };
};
