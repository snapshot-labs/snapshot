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
  const { actionWithAlias } = useAliasAction();

  const DEFINED_APP = (route?.query.app as string) || 'snapshot';

  const isSending = ref(false);

  function errorNotification(description: string) {
    notify([
      'red',
      description ? `Oops, ${description}` : t('notify.somethingWentWrong')
    ]);
    notifyModal('warning', description);
  }

  async function send(space, type, payload) {
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

  const signParams = {
    get provider() {
      return auth.web3;
    },
    get address() {
      return web3.value.account;
    }
  };

  function vote(client, votePayload, { provider, address } = signParams) {
    return client.vote(provider, address, votePayload);
  }

  function proposal(
    client,
    proposalPayload,
    { provider, address } = signParams
  ) {
    return client.proposal(provider, address, proposalPayload);
  }

  function deleteProposal(
    client,
    deleteProposalPayload,
    { provider, address } = signParams
  ) {
    return client.cancelProposal(provider, address, deleteProposalPayload);
  }

  function bindWithAlias(actionFn) {
    return (client, payload) => {
      return actionWithAlias(aliasWallet =>
        actionFn(client, payload, {
          provider: aliasWallet,
          address: aliasWallet.address
        })
      );
    };
  }

  async function sendEIP712(space, type, payload) {
    const client = isGnosisSafe.value ? clientGnosisSafe : clientEIP712;
    if (type === 'proposal') {
      const shouldUseAlias = space.voting?.aliased && !isGnosisSafe.value;
      const proposalFn = shouldUseAlias ? bindWithAlias(proposal) : proposal;

      let plugins = {};
      if (Object.keys(payload.metadata?.plugins).length !== 0)
        plugins = payload.metadata.plugins;

      const proposalPayload = {
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
        app: DEFINED_APP,
        from: web3.value.account
      };

      return proposalFn(client, proposalPayload);
    } else if (type === 'vote') {
      const shouldUseAlias = space.voting?.aliased && !isGnosisSafe.value;
      const voteFn = shouldUseAlias ? bindWithAlias(vote) : vote;

      const votePayload = {
        space: space.id,
        proposal: payload.proposal.id,
        type: payload.proposal.type,
        choice: payload.choice,
        privacy: payload.privacy,
        app: DEFINED_APP,
        reason: payload.reason,
        from: web3.value.account
      };

      return voteFn(client, votePayload);
    } else if (type === 'delete-proposal') {
      const shouldUseAlias = space.voting?.aliased && !isGnosisSafe.value;
      const deleteProposalFn = shouldUseAlias
        ? bindWithAlias(deleteProposal)
        : deleteProposal;

      const deleteProposalPayload = {
        space: space.id,
        proposal: payload.proposal.id,
        from: web3.value.account
      };

      return deleteProposalFn(client, deleteProposalPayload);
    } else if (type === 'settings') {
      return client.space(auth.web3, web3.value.account, {
        space: space.id,
        settings: JSON.stringify(payload)
      });
    } else if (type === 'delete-space') {
      return client.deleteSpace(auth.web3, web3.value.account, {
        space: space.id
      });
    }
  }

  return { send, isSending, isGnosisSafe };
}
