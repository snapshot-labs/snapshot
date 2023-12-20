import snapshot from '@snapshot-labs/snapshot.js';
import { ERC20ABI } from '@/helpers/constants';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';

async function getERC20Account(
  provider: any,
  account: string,
  token: string,
  chainId: string,
  contract: string
) {
  const multi = new snapshot.utils.Multicaller(chainId, provider, ERC20ABI, {});
  multi.call('balance', token, 'balanceOf', [account]);
  multi.call('allowance', token, 'allowance', [account, contract]);
  return await multi.execute();
}

export function useAccount() {
  const auth = getInstance();
  const { web3Account } = useWeb3();

  const account = ref<{
    balance?: string;
    allowance?: string;
  }>({});
  const updatingAccount = ref(false);

  async function updateAccount(
    token: string,
    network: string,
    contract: string
  ) {
    account.value = {};
    updatingAccount.value = true;
    try {
      account.value = await getERC20Account(
        auth.web3,
        web3Account.value,
        token,
        network,
        contract
      );
    } catch (e) {
      console.log('Error getting account', e);
    } finally {
      updatingAccount.value = false;
    }
  }

  return {
    account,
    updatingAccount,
    updateAccount
  };
}
