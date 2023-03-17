import { computed, ref, watch } from 'vue';
import uniqBy from 'lodash/uniqBy';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { useProfiles, useWeb3, useInfiniteLoader } from '@/composables';
import { Proposal, Vote } from '@/helpers/interfaces';
import { getProposalVotes } from '@/helpers/snapshot';

export function useProposalVotesList(
  proposal: Proposal,
  userVote: Vote | null
) {
  const { web3Account } = useWeb3();

  const loadedVotes = ref(false);
  const votes = ref<Vote[]>([]);

  const isZero = computed(() => {
    if (!loadedVotes.value) return true;
    if (votes.value.length > 0) return false;
    return true;
  });

  const sortedVotes = computed(() => {
    const votesClone = clone(votes.value);
    if (userVote) votesClone.push(userVote);
    const uniqVotes = uniqBy(votesClone, 'ipfs' as any);
    if (uniqVotes.map(vote => vote.voter).includes(web3Account.value)) {
      uniqVotes.unshift(
        uniqVotes.splice(
          uniqVotes.findIndex(item => item.voter === web3Account.value),
          1
        )[0]
      );
    } else {
      uniqVotes.sort((a, b) => b.balance - a.balance);
    }
    return uniqVotes;
  });

  function formatProposalVotes(votes) {
    if (!votes.length) return [];
    return votes.map(vote => {
      vote.balance = vote.vp;
      vote.scores = vote.vp_by_strategy;
      return vote;
    });
  }

  async function loadVotes(first = 6) {
    const votesRes = await getProposalVotes(proposal.id, {
      first,
      space: proposal.space.id
    });

    votes.value = formatProposalVotes(votesRes);
    loadedVotes.value = true;
  }

  const { loadBy, loadMore, loadingMore } = useInfiniteLoader(20);

  async function loadMoreVotes() {
    const votesObj = await getProposalVotes(proposal.id, {
      first: loadBy,
      skip: votes.value.length
    });
    votes.value = votes.value.concat(formatProposalVotes(votesObj));
  }

  const { profiles, loadProfiles } = useProfiles();

  watch(sortedVotes, () => {
    loadProfiles(sortedVotes.value.map(vote => vote.voter));
  });

  return {
    isZero,
    votes,
    loadedVotes,
    sortedVotes,
    formatProposalVotes,
    loadVotes,
    loadMore,
    loadMoreVotes,
    loadingMore,
    profiles
  };
}
