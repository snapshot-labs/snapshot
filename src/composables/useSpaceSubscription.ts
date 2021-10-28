import { computed, ref, watch } from 'vue';
import { useWeb3 } from '@/composables/useWeb3';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { SUBSCRIPTIONS_QUERY } from '@/helpers/queries';
import { useAliasAction } from '@/composables/useAliasAction';
import client from '@/helpers/clientEIP712';

const subscriptions = ref<any[] | undefined>(undefined);

export function useSpaceSubscription(spaceId: any) {
  const { web3 } = useWeb3();
  const { apolloQuery } = useApolloQuery();
  const { setAlias, aliasWallet, isValidAlias, checkAlias } = useAliasAction();

  const loading = ref(false);
  const web3Account = computed(() => web3.value.account);
  const isSubscribed = computed(() => {
    return subscriptions.value?.some((subscription: any) => {
      return (
        subscription.space.id === spaceId &&
        subscription.address === web3Account.value
      );
    });
  });

  async function loadSubscriptions() {
    if (!web3Account.value) return;

    loading.value = true;
    try {
      const spaceSubscriptions = await apolloQuery(
        {
          query: SUBSCRIPTIONS_QUERY,
          variables: {
            address: web3Account.value
          }
        },
        'subscriptions'
      );
      if (spaceSubscriptions) {
        subscriptions.value = spaceSubscriptions;
      } else {
        subscriptions.value = undefined;
      }
    } catch (e) {
      console.error(e);
      subscriptions.value = undefined;
    } finally {
      loading.value = false;
    }
  }

  async function toggleSubscription() {
    if (web3.value.authLoading) {
      return null;
    }

    loading.value = true;
    try {
      await checkAlias();
      if (!aliasWallet.value || !isValidAlias.value) {
        await setAlias();
      }

      if (isSubscribed.value) {
        await client.unsubscribe(aliasWallet.value, aliasWallet.value.address, {
          from: web3Account.value,
          space: spaceId
        });
      } else {
        await client.subscribe(aliasWallet.value, aliasWallet.value.address, {
          from: web3Account.value,
          space: spaceId
        });
      }
      await loadSubscriptions();
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  }

  // load subscriptions when the hook is loaded on the page.
  watch(web3Account, () => {
    if (subscriptions.value === undefined) {
      loadSubscriptions();
    }
  });

  return {
    toggleSubscription,
    loading,
    isSubscribed
  };
}
