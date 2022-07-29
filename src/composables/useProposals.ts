import { reactive, watch, ref } from 'vue';
import { Proposal } from '@/helpers/interfaces';
import { USER_VOTED_PROPOSAL_IDS_QUERY } from '@/helpers/queries';
import { useApolloQuery, useWeb3 } from '@/composables';

interface ProposalsStore {
  space: {
    proposals: Proposal[];
    filterBy: string;
  };
  timeline: {
    proposals: Proposal[];
    filterBy: string;
  };
}

const store = reactive<ProposalsStore>({
  space: {
    proposals: [],
    filterBy: 'all'
  },
  timeline: {
    proposals: [],
    filterBy: 'all'
  }
});

const userVotedProposalIds = ref<string[]>([]);

export function useProposals() {
  function removeSpaceProposal(id: string) {
    store.space.proposals = store.space.proposals.filter(
      proposal => proposal.id !== id
    );
  }

  function resetSpaceProposals() {
    store.space.proposals = [];
  }

  function resetTimelineProposals() {
    store.timeline.proposals = [];
  }

  function setSpaceFilter(filter: string) {
    store.space.filterBy = filter;
    resetSpaceProposals();
  }

  function setTimelineFilter(filter: string) {
    store.timeline.filterBy = filter;
    resetTimelineProposals();
  }

  const { apolloQuery } = useApolloQuery();
  async function getUserVotedProposalIds(voter: string, proposals: string[]) {
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

  const { web3Account } = useWeb3();
  watch(
    () => [store.space.proposals, store.timeline.proposals],
    value => {
      const proposalIds = value[0]
        .map(proposal => proposal.id)
        .concat(value[1].map(proposal => proposal.id));
      getUserVotedProposalIds(web3Account.value, proposalIds);
    }
  );

  return {
    store,
    userVotedProposalIds,
    removeSpaceProposal,
    resetSpaceProposals,
    resetTimelineProposals,
    setSpaceFilter,
    setTimelineFilter
  };
}
