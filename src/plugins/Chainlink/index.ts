import snapshot from '@snapshot-labs/snapshot.js';
import { useWeb3 } from '@/composables/useWeb3';

export const usePlugin = () => {
  const { getAuth, web3Account } = useWeb3();

  const getCurrentResults = async (registryAddress: string, proposalId: string) => {
    const balance = await snapshot.utils.sendTransaction(
      getAuth().web3,
      registryAddress,
      ['function balanceOf(address) view returns (uint256)'],
      'balanceOf',
      [web3Account.value]
    );

    return balance;
  };

  return {
    getCurrentResults
  }
}