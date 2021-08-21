import { computed, ref } from 'vue';
import { lsGet, lsSet } from '@/helpers/utils';
import { useWeb3 } from '@/composables/useWeb3';
import { Wallet } from '@ethersproject/wallet';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { getDefaultProvider, Provider } from '@ethersproject/providers';
import { ALIASES_QUERY } from '@/helpers/queries';
import { useApolloQuery } from '@/composables/useApolloQuery';
import client from '@/helpers/EIP712';

export function useAliasAction() {
  const { web3 } = useWeb3();
  const auth = getInstance();
  const { apolloQuery } = useApolloQuery();

  const aliases = ref(lsGet('aliases') || {});
  const isValidAlias = ref(false);

  const userAlias = computed(() => {
    return aliases.value?.[web3.value.account];
  });

  const aliasWallet: any = computed(() => {
    const provider: Provider = getDefaultProvider();
    return userAlias.value ? new Wallet(userAlias.value, provider) : null;
  });

  async function checkAlias() {
    if (aliasWallet.value?.address && web3.value?.account) {
      const alias = await apolloQuery(
        {
          query: ALIASES_QUERY,
          variables: {
            address: web3.value.account,
            alias: aliasWallet.value.address
          }
        },
        'aliases'
      );

      isValidAlias.value =
        alias[0]?.address === web3.value.account &&
        alias[0]?.alias === aliasWallet.value.address;
    }
  }

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
    await checkAlias();
  }

  return { setAlias, aliasWallet, isValidAlias, checkAlias };
}
