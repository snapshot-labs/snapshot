import { reactive, watch, ref, computed } from 'vue';
import { Proposal } from '@/helpers/interfaces';
import { USER_VOTED_PROPOSAL_IDS_QUERY } from '@/helpers/queries';
import { useApolloQuery, useWeb3 } from '@/composables';

interface ProposalsStore {
  space: {
    proposals: Proposal[];
  };
  timeline: {
    proposals: Proposal[];
  };
}

const store = reactive<ProposalsStore>({
  space: {
    proposals: []
  },
  timeline: {
    proposals: []
  }
});

const userVotedProposalIds = ref<string[]>([]);

export function useProposals() {
  function setTimelineProposals(proposals) {
    store.timeline.proposals = proposals;
  }

  function addTimelineProposals(proposals) {
    store.timeline.proposals = store.timeline.proposals.concat(proposals);
  }

  function setSpaceProposals(proposals) {
    store.space.proposals = proposals;
  }

  function addSpaceProposals(proposals) {
    store.space.proposals = store.space.proposals.concat(proposals);
  }

  function resetSpaceProposals() {
    store.space.proposals = [];
  }

  function removeSpaceProposal(id: string) {
    store.space.proposals = store.space.proposals.filter(
      proposal => proposal.id !== id
    );
  }

  function addVotedProposalId(id: string) {
    userVotedProposalIds.value.push(id);
  }

  const { apolloQuery } = useApolloQuery();
  async function getUserVotedProposalIds(voter: string, proposals: string[]) {
    if (!voter || !proposals) return;
    const votes = await apolloQuery(
      {
        query: USER_VOTED_PROPOSAL_IDS_QUERY,
        variables: {
          voter,
          proposals
        }
      },
      'votes'
    );

    const proposalId = votes.map(vote => vote.proposal.id);
    userVotedProposalIds.value = [
      ...new Set(userVotedProposalIds.value.concat(proposalId))
    ];
  }

  const proposalIds = computed(() =>
    store.space.proposals
      .map(proposal => proposal.id)
      .concat(store.timeline.proposals.map(proposal => proposal.id))
  );

  const { web3Account } = useWeb3();
  watch(
    () => [store.space.proposals, store.timeline.proposals],
    () => {
      getUserVotedProposalIds(web3Account.value, proposalIds.value);
    }
  );

  watch(web3Account, () => {
    userVotedProposalIds.value = [];
    getUserVotedProposalIds(web3Account.value, proposalIds.value);
  });

  return {
    store,
    userVotedProposalIds,
    addVotedProposalId,
    setSpaceProposals,
    addSpaceProposals,
    resetSpaceProposals,
    removeSpaceProposal,
    setTimelineProposals,
    addTimelineProposals
  };
}
