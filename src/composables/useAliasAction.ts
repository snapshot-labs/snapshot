import { computed, ref } from 'vue';
import { lsGet, lsSet } from '@/helpers/utils';
import { useWeb3 } from '@/composables/useWeb3';
import { Wallet } from '@ethersproject/wallet';

export function useAliasAction() {
  const { web3 } = useWeb3();

  const aliases = ref(lsGet('aliases') || {});

  const alias = computed(() => {
    return aliases.value[web3.value.account];
  });

  function signWithAlias(sign) {
    if (!alias.value) setAlias();
    else sign();
  }

  function setAlias() {
    const wallet = Wallet.createRandom();
    lsSet(
      'aliases',
      Object.assign(aliases.value, {
        [web3.value.account]: wallet.privateKey
      })
    );
    // TODO: save wallet.address to hub
    aliases.value = lsGet('aliases');
  }

  return { signWithAlias };
}
