import { Proposal, Vote, VoteFilters } from '@/helpers/interfaces';
import { VOTES_QUERY } from '@/helpers/queries';

type QueryParams = {
  voter?: string;
} & Partial<VoteFilters>;

export function useProposalVotes(proposal: Proposal, loadBy = 6) {
  const { profiles, loadProfiles } = useProfiles();
  const { apolloQuery } = useApolloQuery();
  const { resolveName } = useResolveName();

  const loadingVotes = ref(false);
  const loadingMoreVotes = ref(false);
  const loadingUserVote = ref(false);
  const votes = ref<Vote[]>([]);
  const userVote = ref<Vote | null>(null);

  async function _fetchVotes(queryParams: QueryParams, skip = 0) {
    const response = await apolloQuery(
      {
        query: VOTES_QUERY,
        variables: {
          id: proposal.id,
          first: loadBy,
          skip,
          orderBy: 'vp',
          orderDirection: queryParams.orderDirection || 'desc',
          reason_not: queryParams.onlyWithReason ? '' : undefined,
          voter: queryParams.voter || undefined
        }
      },
      'votes'
    );

    loadProfiles(response.map(vote => vote.voter));
    return response;
  }

  async function _fetchVote(queryParams: QueryParams) {
    const response = await apolloQuery(
      {
        query: VOTES_QUERY,
        variables: {
          id: proposal.id,
          voter: queryParams.voter
        }
      },
      'votes'
    );

    loadProfiles(response.map(vote => vote.voter));
    return response;
  }

  function formatProposalVotes(votes: Vote[]) {
    if (!votes?.length) return [];
    return votes.map(vote => {
      vote.balance = vote.vp;
      vote.scores = vote.vp_by_strategy;
      return vote;
    });
  }

  async function loadVotes(filter: Partial<VoteFilters> = {}) {
    if (loadingVotes.value) return;

    loadingVotes.value = true;
    try {
      const response = await _fetchVotes(filter);
      votes.value = formatProposalVotes(response);
    } catch (e) {
      console.log(e);
    } finally {
      loadingVotes.value = false;
    }
  }

  async function loadSingleVote(search: string) {
    loadingVotes.value = true;

    const response = await resolveName(search);
    const voter = response || search;
    try {
      const response = await _fetchVote({ voter });
      votes.value = formatProposalVotes(response);
    } catch (e) {
      console.log(e);
    } finally {
      loadingVotes.value = false;
    }
  }

  async function loadMoreVotes(filter: Partial<VoteFilters> = {}) {
    if (loadingMoreVotes.value || loadingVotes.value) return;

    loadingMoreVotes.value = true;
    try {
      const response = await _fetchVotes(filter, votes.value.length);
      votes.value = votes.value.concat(formatProposalVotes(response));
    } catch (e) {
      console.log(e);
    } finally {
      loadingMoreVotes.value = false;
    }
  }

  async function loadUserVote(voter: string) {
    if (!voter) {
      userVote.value = null;
      return;
    }
    try {
      loadingUserVote.value = true;
      const response = await _fetchVote({ voter });
      userVote.value = formatProposalVotes(response)[0];
    } catch (e) {
      console.log(e);
    } finally {
      loadingUserVote.value = false;
    }
  }

  return {
    votes,
    profiles,
    loadingVotes,
    loadingMoreVotes,
    loadingUserVote: computed(() => loadingUserVote.value),
    userVote,
    formatProposalVotes,
    loadVotes,
    loadMoreVotes,
    loadSingleVote,
    loadUserVote
  };
}
