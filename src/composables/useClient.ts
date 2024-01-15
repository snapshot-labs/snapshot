import clientEIP712 from '@/helpers/clientEIP712';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';

export function useClient() {
  const { t } = useI18n();
  const { notify } = useFlashNotification();
  const { notifyModal } = useModalNotification();
  const { isGnosisSafe } = useGnosis();
  const { mixpanel } = useMixpanel();
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
    let plugins = {};
    const client = clientEIP712;

    if (
      payload.metadata?.plugins &&
      Object.keys(payload.metadata?.plugins).length !== 0
    )
      plugins = payload.metadata.plugins;

    if (type === 'create-proposal') {
      const receipt = await client.proposal(auth.web3, web3.value.account, {
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

      mixpanel.track('Propose', {
        space: space.id
      });

      return receipt;
    } else if (type === 'update-proposal') {
      const receipt = await client.updateProposal(
        auth.web3,
        web3.value.account,
        {
          proposal: payload.id,
          space: space.id,
          type: payload.type,
          title: payload.name,
          body: payload.body,
          discussion: payload.discussion,
          choices: payload.choices,
          plugins: JSON.stringify(plugins)
        }
      );

      mixpanel.track('Update proposal', {
        space: space.id,
        proposalId: payload.id
      });

      return receipt;
    } else if (type === 'vote') {
      const receipt = await client.vote(auth.web3, web3.value.account, {
        space: space.id,
        proposal: payload.proposal.id,
        type: payload.proposal.type,
        choice: payload.choice,
        privacy: payload.privacy,
        app: DEFINED_APP,
        reason: payload.reason
      });

      mixpanel.track('Vote', {
        space: space.id,
        proposalId: payload.proposal.id
      });

      return receipt;
    } else if (type === 'delete-proposal') {
      const receipt = await client.cancelProposal(
        auth.web3,
        web3.value.account,
        {
          space: space.id,
          proposal: payload.proposal.id
        }
      );

      mixpanel.track('Delete proposal', {
        space: space.id,
        proposalId: payload.proposal.id
      });

      return receipt;
    } else if (type === 'settings') {
      const receipt = await client.space(auth.web3, web3.value.account, {
        space: space.id,
        settings: JSON.stringify(payload)
      });

      mixpanel.track('Update space settings', {
        space: space.id
      });

      return receipt;
    } else if (type === 'delete-space') {
      const receipt = await client.deleteSpace(auth.web3, web3.value.account, {
        space: space.id
      });

      mixpanel.track('Delete space', {
        space: space.id
      });

      return receipt;
    } else if (type === 'set-statement') {
      const receipt = await client.statement(auth.web3, web3.value.account, {
        space: space.id,
        about: payload.about,
        statement: payload.statement
      });

      mixpanel.track('Set statement', {
        space: space.id
      });

      return receipt;
    } else if (type === 'flag-proposal') {
      const receipt = await client.flagProposal(auth.web3, web3.value.account, {
        space: space.id,
        proposal: payload.proposal.id
      });

      mixpanel.track('Flag proposal', {
        space: space.id,
        proposalId: payload.proposal.id
      });

      return receipt;
    }
  }

  return { send, isSending, isGnosisSafe };
}
