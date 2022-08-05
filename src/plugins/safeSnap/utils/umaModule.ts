import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { multicall } from '@snapshot-labs/snapshot.js/src/utils';
import { REALITY_MODULE_ABI } from '../constants';

export const getModuleDetails = async (
  provider: StaticJsonRpcProvider,
  network: string,
  moduleAddress: string
): Promise<{
  gnosisSafeAddress: string;
  oracle: string;
  cooldown: number;
  minimumBond: number;
  expiration: number;
}> => {
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
    gnosisSafeAddress: moduleDetails[0][0],
    oracle: moduleDetails[1][0],
    cooldown: moduleDetails[2][0],
    minimumBond: moduleDetails[3][0],
    expiration: moduleDetails[4][0]
  };
};
