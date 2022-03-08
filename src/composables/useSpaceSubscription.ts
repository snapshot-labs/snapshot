import { computed, ref } from 'vue';
import { useWeb3 } from '@/composables/useWeb3';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { SUBSCRIPTIONS_QUERY } from '@/helpers/queries';
import { useAliasAction } from '@/composables/useAliasAction';
import { beams } from '../helpers/beams';
import { useFlashNotification } from './useFlashNotification';
import { useI18n } from '@/composables/useI18n';
import client from '@/helpers/clientEIP712';

const subscriptions = ref<any[] | undefined>(undefined);

export function useSpaceSubscription(spaceId: any) {
  const { web3, web3Account } = useWeb3();
  const { apolloQuery } = useApolloQuery();
  const { setAlias, aliasWallet, isValidAlias, checkAlias } = useAliasAction();
  const { notify } = useFlashNotification();
  const { t } = useI18n();
  const loading = ref(false);
  const isSubscribed = computed(() => {
    return (
      subscriptions.value?.some((subscription: any) => {
        return (
          subscription.space.id === spaceId &&
          subscription.address === web3Account.value
        );
      }) ?? false
    );
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

  const configurePush = async () => {
    try {
      if (!beams) {
        notify(['red', t('notificationsNotSupported')]);
        return;
      }

      await beams.start();
      await beams.addDeviceInterest(web3Account.value);
      await client.subscribe(aliasWallet.value, aliasWallet.value.address, {
        from: web3Account.value,
        space: spaceId
      });
    } catch (error: any) {
      // thrown by beams when the user denies the notification permission or browser doesn't support it
      if (error.name === 'NotAllowedError')
        notify(['red', t('notificationsBlocked')]);
      console.error(error);
    }
  };

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
        await configurePush();
      }
      await loadSubscriptions();
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  }

  return {
    toggleSubscription,
    loading,
    isSubscribed,
    subscriptions,
    loadSubscriptions
  };
}
