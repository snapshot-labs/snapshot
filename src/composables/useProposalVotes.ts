import uniqBy from 'lodash/uniqBy';
import { watchDebounced } from '@vueuse/core';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { Proposal, Vote, VoteFilters } from '@/helpers/interfaces';
import { getProposalVotes } from '@/helpers/snapshot';
import { isAddress } from '@ethersproject/address';

export function useProposalVotes(
  proposal: Proposal,
  loadBy = 6,
  userVote: Vote | null,
  filters?: Ref<VoteFilters>
) {
  const { web3Account } = useWeb3();
  const { profiles, loadProfiles } = useProfiles();
  const { isValidEnsDomain } = useEns();
  const { loadMore, loadingMore } = useInfiniteLoader(loadBy);

  const loadedVotes = ref(false);
  const votes = ref<Vote[]>([]);
  const searchAddress = ref('');
  const noVotesFound = ref(false);

  const isZero = computed(() => {
    if (!loadedVotes.value) return false;
    if (votes.value.length === 0) return true;
    return false;
  });

  const sortedVotes = computed(() => {
    if (filters?.value) return votes.value;
    const votesClone = clone(votes.value);
    if (userVote) votesClone.unshift(userVote);
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

  function getFilters() {
    const filterOptions: Partial<VoteFilters> = {
      space: proposal.space.id
    };

    if (searchAddress.value?.length) {
      filterOptions.voter = searchAddress.value;
    }

    if (filters?.value?.orderBy) {
      filterOptions.orderBy = filters.value.orderBy;
    }

    if (filters?.value?.orderDirection) {
      filterOptions.orderDirection = filters.value.orderDirection;
    }

    if (filters?.value?.onlyWithReason) {
      filterOptions.reason_not = '';
    }

    if (filters?.value?.choice_in) {
      filterOptions.choice_in = filters.value.choice_in;
    }

    return filterOptions;
  }

  function formatProposalVotes(votes) {
    if (!votes.length) return [];
    return votes.map(vote => {
      vote.balance = vote.vp;
      vote.scores = vote.vp_by_strategy;
      return vote;
    });
  }

  async function loadVotes() {
    const votesRes = await getProposalVotes(proposal.id, {
      first: loadBy,
      space: proposal.space.id,
      voter: searchAddress.value,
      ...getFilters()
    });

    if (votesRes.length === 0) noVotesFound.value = true;
    votes.value = formatProposalVotes(votesRes);
    loadedVotes.value = true;
  }

  async function loadMoreVotes() {
    const votesRes = await getProposalVotes(proposal.id, {
      first: loadBy,
      skip: votes.value.length,
      voter: searchAddress.value,
      ...getFilters()
    });
    votes.value = votes.value.concat(formatProposalVotes(votesRes));
    loadedVotes.value = true;
  }

  function clearVotes() {
    loadedVotes.value = false;
    votes.value = [];
    searchAddress.value = '';
  }

  async function resolveEns(ens: string) {
    try {
      const provider = getProvider('1');
      const addressResolved = await provider.resolveName(ens);
      if (!addressResolved) throw new Error('Invalid ENS name');
      return addressResolved;
    } catch (error) {
      console.error('Error in resolveEns:', error);
      return null;
    }
  }

  async function resolveLens(handle: string) {
    try {
      const response = await fetch('https://api.lens.dev/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: `
          query Profiles {
            profiles(request: { handles: ["${handle}"], limit: 1 }) {
              items {
                ownedBy
              }
            }
          }
        `
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const result = await response.json();
      return result.data?.profiles?.items?.[0]?.ownedBy;
    } catch (error) {
      console.error('Error in resolveLens:', error);
      return null;
    }
  }

  watch(sortedVotes, () => {
    loadProfiles(sortedVotes.value.map(vote => vote.voter));
  });

  watchDebounced(
    () => filters?.value,
    async val => {
      searchAddress.value = '';
      loadedVotes.value = false;
      noVotesFound.value = false;

      if (!val) {
        loadedVotes.value = true;
        return;
      }

      const voter = val?.voter;
      if (voter?.length) {
        if (isAddress(voter.toLowerCase())) {
          searchAddress.value = voter;
        } else if (isValidEnsDomain(voter)) {
          searchAddress.value = await resolveEns(voter);
        } else if (voter.endsWith('.lens')) {
          searchAddress.value = await resolveLens(voter);
        }

        if (!searchAddress.value) {
          loadedVotes.value = true;
          noVotesFound.value = true;
          return;
        }
      }

      loadVotes();
    },
    { debounce: 300, deep: true }
  );

  return {
    isZero,
    noVotesFound,
    votes,
    loadedVotes,
    sortedVotes,
    loadingMore,
    profiles,
    searchAddress,
    formatProposalVotes,
    loadVotes,
    loadMore,
    loadMoreVotes,
    clearVotes
  };
}
