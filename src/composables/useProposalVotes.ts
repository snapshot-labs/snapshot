import uniqBy from 'lodash/uniqBy';
import { watchDebounced } from '@vueuse/core';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
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
  const searchVote = ref<Vote[]>([]);
  const noVotesFound = ref(false);

  const isZero = computed(() => {
    if (!loadedVotes.value) return false;
    if (votes.value.length === 0) return true;
    return false;
  });

  const sortedVotes = computed(() => {
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
      voter: searchAddress.value
    });

    votes.value = formatProposalVotes(votesRes);
    loadedVotes.value = true;
  }

  async function loadMoreVotes() {
    const votesObj = await getProposalVotes(proposal.id, {
      first: loadBy,
      space: proposal.space.id,
      skip: votes.value.length,
      voter: searchAddress.value
    });
    votes.value = votes.value.concat(formatProposalVotes(votesObj));
    loadedVotes.value = true;
  }

  async function loadSearchVote() {
    const votesObj = await getProposalVotes(proposal.id, {
      space: proposal.space.id,
      voter: searchAddress.value
    });

    if (votesObj.length === 0) {
      noVotesFound.value = true;
    } else {
      searchVote.value = formatProposalVotes(votesObj);
    }
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
    () => search?.value,
    async val => {
      searchAddress.value = '';
      loadedVotes.value = false;
      noVotesFound.value = false;
      if (!val) {
        searchVote.value = [];
        loadedVotes.value = true;
        return;
      }

      if (isAddress(val.toLowerCase())) {
        searchAddress.value = val;
      } else if (isValidEnsDomain(val)) {
        searchAddress.value = await resolveEns(val);
      } else if (val.endsWith('.lens')) {
        searchAddress.value = await resolveLens(val);
      }

      if (!searchAddress.value) {
        loadedVotes.value = true;
        noVotesFound.value = true;
        return;
      }
      loadSearchVote();
    },
    { debounce: 300 }
  );

  return {
    isZero,
    noVotesFound,
    votes,
    searchVote,
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
