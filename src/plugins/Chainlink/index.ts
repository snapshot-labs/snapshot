import snapshot from '@snapshot-labs/snapshot.js';
import { useWeb3 } from '@/composables/useWeb3';

export const usePlugin = () => {
  const { getAuth, web3Account } = useWeb3();

  const requestResult = async (registryAddress: string, oracle: string, job: string, proposalId: string) => {
    try {
      const result = await snapshot.utils.sendTransaction(
        getAuth().web3,
        registryAddress,
        ['function requestResult(address,string,string)'],
        'requestResult',
        [oracle, job, proposalId]
      );
  
      return result;
    } catch (e) {
      console.log('Chainlink Plugin:', e);
      return null;
    }
  };

  const getCurrentResult = async (registryAddress: string, proposalId: string) => {
    try {
      const result = await snapshot.utils.sendTransaction(
        getAuth().web3,
        registryAddress,
        ['function results(string) view returns (bool)'],
        'results',
        [proposalId]
      );
      
      return result;
    } catch (e) {
      console.log('Chainlink Plugin:', e);
      return false;
    }

  };

  return {
    requestResult,
    getCurrentResult
  }
}