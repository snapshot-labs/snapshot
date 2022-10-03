import { ref } from 'vue';
import { useWeb3 } from '@/composables/useWeb3';
import { useAliasAction } from '@/composables/useAliasAction';
import { useFlashNotification } from './useFlashNotification';
import { useI18n } from '@/composables/useI18n';
import firebaseMessaging from '@/helpers/firebase';
import { deleteToken, getToken } from 'firebase/messaging';

const isSubscribed = ref<boolean>(false);
const token = ref<string | undefined>(undefined);
const webhookUrl =
  (import.meta.env.VITE_WEBHOOK_URL as string) ?? 'http://localhost:3000';
const vapidKey = (import.meta.env.VITE_VAPID_KEY as string) ?? '';

export function useSpaceSubscription() {
  const { web3, web3Account } = useWeb3();
  const { setAlias, aliasWallet, isValidAlias, checkAlias } = useAliasAction();
  const { notify } = useFlashNotification();
  const { t } = useI18n();
  const loading = ref(false);

  async function loadToken() {
    const isNotificationEnabled =
      Notification && Notification.permission === 'granted';
    if (!isNotificationEnabled) return;

    try {
      token.value = await getToken(firebaseMessaging, {
        vapidKey
      });

      const response = await fetch(`${webhookUrl}/api/subscribed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: token.value,
          owner: web3Account.value
        })
      }).then(res => res.json());

      isSubscribed.value = response.subscribed;
    } catch (err) {
      isSubscribed.value = false;
      token.value = undefined;
      console.error('Error validating device token', err);
    }
  }

  async function updateDeviceToken(unsubscribe: boolean) {
    try {
      if (token.value) {
        await fetch(`${webhookUrl}/api/device`, {
          method: unsubscribe ? 'DELETE' : 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            token: token.value,
            owner: web3Account.value
          })
        });
      }
    } catch (err) {
      console.error('Error updating FCM device token', err);
    }
  }

  const configurePush = async () => {
    try {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        await updateDeviceToken(false);
      } else {
        notify(['red', t('notificationsBlocked')]);
        return;
      }
    } catch (error: any) {
      notify(['red', t('notificationsNotSupported')]);
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
        await updateDeviceToken(true);
        await deleteToken(firebaseMessaging);
      } else {
        await configurePush();
      }

      await loadToken();
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  }

  async function toggleSpaceSubscription(spaceId, isFollowing) {
    if (web3.value.authLoading) {
      return null;
    }

    try {
      await checkAlias();
      if (!aliasWallet.value || !isValidAlias.value) {
        await setAlias();
      }

      // Subscribe/unsubscribe user to space notifications
      await fetch(`${webhookUrl}/api/subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          owner: web3Account.value,
          spaceId,
          unsubscribe: isFollowing
        })
      });
    } catch (e) {
      console.error('Error toggling space subscription', e);
    }
  }

  return {
    toggleSubscription,
    toggleSpaceSubscription,
    loading,
    isSubscribed,
    loadToken,
    token
  };
}
