import { computed, ref } from 'vue';
import { lsGet, lsSet } from '@/helpers/utils';
import { useWeb3 } from '@/composables/useWeb3';
import { Wallet } from '@ethersproject/wallet';
import { getDefaultProvider } from '@ethersproject/providers';

export function useAliasAction() {
  const { web3 } = useWeb3();

  const aliases = ref(lsGet('aliases') || {});

  const userAlias = computed(() => {
    return aliases.value?.[web3.value.account];
  });

  const aliasWallet = computed(() => {
    const provider = getDefaultProvider();
    return userAlias.value ? new Wallet(userAlias.value, provider) : null;
  });

  function setAlias() {
    console.log('asf', aliases.value);
    const rndWallet = Wallet.createRandom();
    lsSet(
      'aliases',
      Object.assign(
        {
          [web3.value.account]: rndWallet.privateKey
        },
        aliases.value
      )
    );
    // TODO: save rndWallet.address to hub?
    aliases.value = lsGet('aliases');
  }

  return { setAlias, aliasWallet };
}
