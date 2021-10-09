import { useI18n } from 'vue-i18n';
import client from '@/helpers/client';
import { useWeb3 } from '@/composables/useWeb3';
import { useNotifications } from '@/composables/useNotifications';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';

export function useClient() {
  const { t } = useI18n();
  const { web3 } = useWeb3();
  const auth = getInstance();
  const { notify } = useNotifications();

  function successNotification(keyword: string) {
    let notification;

    if (keyword === 'delete-proposal')
      notification = ['red', t('notify.proposalDeleted')];
    else if (keyword === 'proposal')
      notification = ['green', t('notify.proposalCreated')];
    else if (keyword === 'settings')
      notification = ['green', t('notify.saved')];
    else if (keyword === 'vote')
      notification = ['green', t('notify.voteSuccessful')];
    else notification = ['green', t('notify.youDidIt')];

    notify([notification[0], notification[1]]);
  }

  async function send(space, type, payload) {
    const isSafe = web3.value?.walletConnectType === 'Gnosis Safe Multisig';
    try {
      const fn = isSafe
        ? client.sign.bind(client)
        : client.broadcast.bind(client);
      const result = await fn(
        auth.web3,
        web3.value.account,
        space,
        type,
        payload
      );
      successNotification(type);
      return result;
    } catch (e: any) {
      const errorMessage =
        e && e.error_description
          ? `Oops, ${e.error_description}`
          : t('notify.somethingWentWrong');
      notify(['red', errorMessage]);
      return;
    }
  }

  return { send };
}
