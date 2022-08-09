import { ref, computed } from 'vue';
import { useI18n } from '@/composables/useI18n';
import client from '@/helpers/client';
import clientGnosisSafe from '@/helpers/clientGnosisSafe';
import clientEIP712 from '@/helpers/clientEIP712';
import { useWeb3 } from '@/composables/useWeb3';
import { useFlashNotification } from '@/composables/useFlashNotification';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';

export function useClient() {
  const { t } = useI18n();
  const { web3 } = useWeb3();
  const auth = getInstance();
  const { notify } = useFlashNotification();

  const isSending = ref(false);

  const connectorName = computed(() => auth.provider.value?.connectorName);

  const usePersonalSign = computed(
    () =>
      connectorName.value === 'walletlink' || connectorName.value === 'gnosis'
  );

  const isGnosisSafe = computed(
    () =>
      web3.value?.walletConnectType === 'Gnosis Safe Multisig' ||
      connectorName.value === 'gnosis'
  );

  async function send(space, type, payload) {
    isSending.value = true;
    try {
      if (usePersonalSign.value) {
        if (payload.proposal) payload.proposal = payload.proposal.id;
        const clientPersonalSign = isGnosisSafe.value
          ? clientGnosisSafe
          : client;
        return await clientPersonalSign.broadcast(
          auth.web3,
          web3.value.account,
          space.id,
          type,
          payload
        );
      }
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
    if (type === 'proposal') {
      let plugins = {};
      if (Object.keys(payload.metadata?.plugins).length !== 0)
        plugins = payload.metadata.plugins;
      return clientEIP712.proposal(auth.web3, web3.value.account, {
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
      return clientEIP712.vote(auth.web3, web3.value.account, {
        space: space.id,
        proposal: payload.proposal.id,
        type: payload.proposal.type,
        choice: payload.choice,
        app: 'snapshot'
      });
    } else if (type === 'delete-proposal') {
      return clientEIP712.cancelProposal(auth.web3, web3.value.account, {
        space: space.id,
        proposal: payload.proposal.id
      });
    } else if (type === 'settings') {
      return clientEIP712.space(auth.web3, web3.value.account, {
        space: space.id,
        settings: JSON.stringify(payload)
      });
    }
  }

  return { send, isSending, isGnosisSafe };
}
