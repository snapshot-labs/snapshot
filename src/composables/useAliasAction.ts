import { computed, ref } from 'vue';
import { lsGet, lsSet } from '@/helpers/utils';
import { useWeb3 } from '@/composables/useWeb3';
import { Wallet } from '@ethersproject/wallet';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { getDefaultProvider, Provider } from '@ethersproject/providers';
import client from '@/helpers/EIP712';

export function useAliasAction() {
  const { web3 } = useWeb3();
  const auth = getInstance();

  const aliases = ref(lsGet('aliases') || {});

  const userAlias = computed(() => {
    return aliases.value?.[web3.value.account];
  });

  const aliasWallet = computed(() => {
    const provider: Provider = getDefaultProvider();
    return userAlias.value ? new Wallet(userAlias.value, provider) : null;
  });

  async function setAlias() {
    const rndWallet = Wallet.createRandom();
    aliases.value = Object.assign(
      {
        [web3.value.account]: rndWallet.privateKey
      },
      aliases.value
    );
    lsSet('aliases', aliases.value);

    if (aliasWallet.value?.address) {
      await client.alias(auth.web3, web3.value.account, {
        alias: aliasWallet.value.address
      });
    }
  }

  return { setAlias, aliasWallet };
}
