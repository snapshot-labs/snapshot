import clientEIP712 from '@/helpers/clientEIP712';

export function useClient() {
  const { t } = useI18n();
  const { notify } = useFlashNotification();
  const { notifyModal } = useModalNotification();
  const { isGnosisSafe } = useGnosis();
  const { web3Account, web3ProviderRef } = useWeb3();
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
    if (
      payload.metadata?.plugins &&
      Object.keys(payload.metadata?.plugins).length !== 0
    )
      plugins = payload.metadata.plugins;
    const client = clientEIP712;
    if (type === 'create-proposal') {
      return client.proposal(web3ProviderRef.value, web3Account.value, {
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
    } else if (type === 'update-proposal') {
      return client.updateProposal(web3ProviderRef.value, web3Account.value, {
        proposal: payload.id,
        space: space.id,
        type: payload.type,
        title: payload.name,
        body: payload.body,
        discussion: payload.discussion,
        choices: payload.choices,
        plugins: JSON.stringify(plugins)
      });
    } else if (type === 'vote') {
      return client.vote(web3ProviderRef.value, web3Account.value, {
        space: space.id,
        proposal: payload.proposal.id,
        type: payload.proposal.type,
        choice: payload.choice,
        privacy: payload.privacy,
        app: DEFINED_APP,
        reason: payload.reason
      });
    } else if (type === 'delete-proposal') {
      return client.cancelProposal(web3ProviderRef.value, web3Account.value, {
        space: space.id,
        proposal: payload.proposal.id
      });
    } else if (type === 'settings') {
      return client.space(web3ProviderRef.value, web3Account.value, {
        space: space.id,
        settings: JSON.stringify(payload)
      });
    } else if (type === 'delete-space') {
      return client.deleteSpace(web3ProviderRef.value, web3Account.value, {
        space: space.id
      });
    } else if (type === 'set-statement') {
      return client.statement(web3ProviderRef.value, web3Account.value, {
        space: space.id,
        about: payload.about,
        statement: payload.statement
      });
    } else if (type === 'flag-proposal') {
      return client.flagProposal(web3ProviderRef.value, web3Account.value, {
        space: space.id,
        proposal: payload.proposal.id
      });
    }
  }

  return { send, isSending, isGnosisSafe };
}
