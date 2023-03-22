import { computed, ref, watch, Ref } from 'vue';
import uniqBy from 'lodash/uniqBy';
import { watchDebounced } from '@vueuse/core';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { useProfiles, useWeb3, useInfiniteLoader, useEns } from '@/composables';
import { Proposal, Vote } from '@/helpers/interfaces';
import { getProposalVotes } from '@/helpers/snapshot';
import { isAddress } from '@ethersproject/address';

export function useProposalVotes(
  proposal: Proposal,
  loadBy = 6,
  userVote: Vote | null,
  search?: Ref<string>
) {
  const { web3Account } = useWeb3();
  const { profiles, loadProfiles } = useProfiles();
  const { isValidEnsDomain } = useEns();
  const { loadMore, loadingMore } = useInfiniteLoader(loadBy);

  const loadedVotes = ref(false);
  const votes = ref<Vote[]>([]);
  const searchAddress = ref('');
  const isENS = ref(false);
  const resolvingENS = ref(false);
  const wrongENS = ref(false);

  const isZero = computed(() => {
    if (!loadedVotes.value) return false;
    if (votes.value.length === 0) return true;
    return false;
  });

  const votesNotFound = computed(() => {
    return Boolean(searchAddress.value.length && votes.value.length === 0);
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

  async function loadVotes(first) {
    const votesRes = await getProposalVotes(proposal.id, {
      first: first || loadBy,
      space: proposal.space.id,
      ...(searchAddress.value ? { voter: searchAddress.value } : {})
    });

    votes.value = formatProposalVotes(votesRes);
    loadedVotes.value = true;
  }

  async function loadMoreVotes() {
    const votesObj = await getProposalVotes(proposal.id, {
      first: loadBy,
      space: proposal.space.id,
      skip: votes.value.length,
      ...(searchAddress.value ? { voter: searchAddress.value } : {})
    });
    votes.value = votes.value.concat(formatProposalVotes(votesObj));
    loadedVotes.value = true;
  }

  function clearVotes() {
    loadedVotes.value = false;
    votes.value = [];
    searchAddress.value = '';
  }

  watch(sortedVotes, () => {
    loadProfiles(sortedVotes.value.map(vote => vote.voter));
  });

  watchDebounced(
    () => search?.value,
    async to => {
      if (to === undefined) return;
      searchAddress.value = '';

      if (isAddress(to)) {
        searchAddress.value = to;
      } else {
        if (isValidEnsDomain(to)) {
          loadedVotes.value = false;
          isENS.value = true;
          resolvingENS.value = true;
          let addressResolved;
          try {
            addressResolved = await getProvider('1').resolveName(to);
          } catch (e) {
            console.warn(':addressResolved error', e);
            resolvingENS.value = false;
            wrongENS.value = true;
          }
          if (addressResolved) {
            wrongENS.value = false;
            searchAddress.value = addressResolved;
          } else {
            wrongENS.value = true;
          }
          resolvingENS.value = false;
        } else {
          searchAddress.value = '';
          isENS.value = false;
          resolvingENS.value = false;
          wrongENS.value = false;
        }
      }

      if (!loadingMore.value) {
        votes.value = [];
        loadedVotes.value = false;
        loadVotes(loadBy);
      }
    },
    { debounce: 600 }
  );

  return {
    isZero,
    votesNotFound,
    votes,
    loadedVotes,
    sortedVotes,
    loadingMore,
    profiles,
    isENS,
    resolvingENS,
    wrongENS,
    formatProposalVotes,
    loadVotes,
    loadMore,
    loadMoreVotes,
    clearVotes
  };
}
