import { ref } from 'vue';
import clientGnosisSafe from '@/helpers/clientGnosisSafe';
import clientEIP712 from '@/helpers/clientEIP712';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';

import { useGnosis } from '@/composables/useGnosis';
import { useWeb3 } from '@/composables/useWeb3';
import { useI18n } from '@/composables/useI18n';
import { useFlashNotification } from '@/composables/useFlashNotification';

export function useClient() {
  const { t } = useI18n();
  const { notify } = useFlashNotification();
  const { isGnosisSafe } = useGnosis();
  const { web3 } = useWeb3();
  const auth = getInstance();

  const isSending = ref(false);

  async function send(space, type, payload) {
    isSending.value = true;
    try {
      return await sendEIP712(space, type, payload);
    } catch (e: any) {
      const errorMessage =
        e?.error_description && typeof e.error_description === 'string'
          ? `Oops, ${e.error_description}`
          : t('notify.somethingWentWrong');
      notify(['red', errorMessage]);
      return e;
    } finally {
      isSending.value = false;
    }
  }

  async function sendEIP712(space, type, payload) {
    const client = isGnosisSafe.value ? clientGnosisSafe : clientEIP712;
    if (type === 'proposal') {
      let plugins = {};
      if (Object.keys(payload.metadata?.plugins).length !== 0)
        plugins = payload.metadata.plugins;
      return client.proposal(auth.web3, web3.value.account, {
        space: space.id,
        type: payload.type,
        title: payload.name,
        body: payload.body,
        discussion: payload.discussion,
        choices: payload.choices,
        start: payload.start,
        end: payload.end,
        snapshot: payload.snapshot,
        plugins: JSON.stringify(plugins),
        app: 'snapshot'
      });
    } else if (type === 'vote') {
      return client.vote(auth.web3, web3.value.account, {
        space: space.id,
        proposal: payload.proposal.id,
        type: payload.proposal.type,
        choice: payload.choice,
        privacy: payload.privacy,
        app: 'snapshot',
        reason: payload.reason
      });
    } else if (type === 'delete-proposal') {
      return client.cancelProposal(auth.web3, web3.value.account, {
        space: space.id,
        proposal: payload.proposal.id
      });
    } else if (type === 'settings') {
      return client.space(auth.web3, web3.value.account, {
        space: space.id,
        settings: JSON.stringify(payload)
      });
    }
  }

  return { send, isSending, isGnosisSafe };
}
