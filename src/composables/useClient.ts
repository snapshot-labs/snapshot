import clientGnosisSafe from '@/helpers/clientGnosisSafe';
import clientEIP712 from '@/helpers/clientEIP712';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';

export function useClient() {
  const { t } = useI18n();
  const { notify } = useFlashNotification();
  const { notifyModal } = useModalNotification();
  const { isGnosisSafe } = useGnosis();
  const { web3 } = useWeb3();
  const auth = getInstance();
  const route = useRoute();

  const DEFINED_APP = (route?.query.app as string) || 'snapshot';

  const isSending = ref(false);

  function errorNotification(description: string) {
    notify([
      'red',
      description ? `Oops, ${description}` : t('notify.somethingWentWrong')
    ]);
    notifyModal('warning', description);
  }

  async function send(space: { id: string }, type: string, payload: any) {
    isSending.value = true;
    try {
      return await sendEIP712(space, type, payload);
    } catch (e: any) {
      errorNotification(e?.error_description || '');
      return e;
    } finally {
      isSending.value = false;
    }
  }

  async function sendEIP712(space: { id: string }, type: string, payload: any) {
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
        app: DEFINED_APP
      });
    } else if (type === 'vote') {
      return client.vote(auth.web3, web3.value.account, {
        space: space.id,
        proposal: payload.proposal.id,
        type: payload.proposal.type,
        choice: payload.choice,
        privacy: payload.privacy,
        app: DEFINED_APP,
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
    } else if (type === 'delete-space') {
      return client.deleteSpace(auth.web3, web3.value.account, {
        space: space.id
      });
    } else if (type === 'set-statement') {
      return client.statement(auth.web3, web3.value.account, {
        space: space.id,
        about: payload.about,
        statement: payload.statement
      });
    }
  }

  return { send, isSending, isGnosisSafe };
}
