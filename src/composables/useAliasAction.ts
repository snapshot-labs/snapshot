/**
 * Alias addresses/wallets are used to reduce the need for signing messages manually, e.g. each time a user wants to join a space.
 * An alias is a randomly generated wallet, of which the private key is stored in the browser's local storage.
 * The user only needs to sign a message once, to "register" the respective alias address on the hub. All following messages can be signed
 * by the alias wallet, without requiring the user's approval. This leads to much better UX, at the cost of less security.
 * If the private key is removed from local storage, a new one will be created and registered.
 */

import { computed, ref } from 'vue';
import { lsGet, lsSet } from '@/helpers/utils';
import { useWeb3 } from '@/composables/useWeb3';
import { Wallet } from '@ethersproject/wallet';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { getDefaultProvider, Provider } from '@ethersproject/providers';
import { ALIASES_QUERY } from '@/helpers/queries';
import { useApolloQuery } from '@/composables/useApolloQuery';
import client from '@/helpers/clientEIP712';

const aliases = ref(lsGet('aliases') || {});
const isValidAlias = ref(false);

export function useAliasAction() {
  const { web3 } = useWeb3();
  const auth = getInstance();
  const { apolloQuery } = useApolloQuery();

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
