import { computed, ref, watch, Ref } from 'vue';
import uniqBy from 'lodash/uniqBy';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { useProfiles, useWeb3, useInfiniteLoader } from '@/composables';
import { Proposal, Vote } from '@/helpers/interfaces';
import { getProposalVotes } from '@/helpers/snapshot';
import { isAddress } from '@ethersproject/address';

export function useProposalVotes(
  proposal: Proposal,
  userVote: Vote | null,
  search?: Ref<string>
) {
  const { web3Account } = useWeb3();

  const loadedVotes = ref(false);
  const votes = ref<Vote[]>([]);

  const searchLocal = computed(() => {
    return search ? search.value : '';
  });
  const searchValid = computed(() => {
    return searchLocal.value && searchLocal.value.length !== 0;
  });
  const searchIsAddress = computed(() => {
    return searchValid.value ? isAddress(searchLocal.value) : false;
  });

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
      space: proposal.space.id,
      ...(searchIsAddress.value ? { voter: searchLocal.value } : {})
    });

    votes.value = formatProposalVotes(votesRes);
    loadedVotes.value = true;
  }

  const { loadBy, loadMore, loadingMore } = useInfiniteLoader(20);

  async function loadMoreVotes() {
    const votesObj = await getProposalVotes(proposal.id, {
      first: loadBy,
      space: proposal.space.id,
      skip: votes.value.length,
      ...(searchIsAddress.value ? { voter: searchLocal.value } : {})
    });
    votes.value = votes.value.concat(formatProposalVotes(votesObj));
  }

  const { profiles, loadProfiles } = useProfiles();

  watch(sortedVotes, () => {
    loadProfiles(sortedVotes.value.map(vote => vote.voter));
  });

  watch(
    () => searchLocal.value,
    to => {
      if (to.length === 0 || searchIsAddress.value) {
        votes.value = [];
        loadVotes(20);
      }
    }
  );

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
