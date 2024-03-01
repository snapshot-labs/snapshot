import {
  DelegateWithPercent,
  DelegatesVote,
  DelegatesProposal,
  ExtendedSpace
} from '@/helpers/interfaces';
import { setupDelegation as getDelegationAdapter } from '@/helpers/delegationV2';
import { DELEGATE_VOTES_AND_PROPOSALS } from '@/helpers/queries';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';

type DelegatesStats = Record<
  string,
  { votes: DelegatesVote[]; proposals: DelegatesProposal[] }
>;

const DELEGATES_LIMIT = 18;

export function useDelegates(space: ExtendedSpace) {
  const auth = getInstance();
  const { resolveName } = useResolveName();
  const { apolloQuery } = useApolloQuery();

  const { reader, writer } = getDelegationAdapter(space, auth);

  const delegates = ref<DelegateWithPercent[]>([]);
  const delegate = ref<DelegateWithPercent | null>(null);
  const isLoadingDelegate = ref(false);
  const isLoadingDelegates = ref(false);
  const isLoadingMoreDelegates = ref(false);
  const hasDelegatesLoadFailed = ref(false);
  const isLoadingDelegatingTo = ref(false);
  const isLoadingDelegateBalance = ref(false);
  const hasMoreDelegates = ref(false);
  const resolvedAddress = ref<string | null>(null);
  const delegatesStats = ref<DelegatesStats>({});

  async function fetchDelegateBatch(orderBy: string, skip = 0) {
    hasDelegatesLoadFailed.value = false;
    return reader.getDelegates(DELEGATES_LIMIT, skip, orderBy);
  }

  async function loadDelegates(orderBy: string) {
    if (isLoadingDelegates.value) return;
    isLoadingDelegates.value = true;

    try {
      const response = await fetchDelegateBatch(orderBy);
      delegates.value = response;
      hasMoreDelegates.value = response.length === DELEGATES_LIMIT;
    } catch (err) {
      console.error(err);
      hasDelegatesLoadFailed.value = true;
    } finally {
      isLoadingDelegates.value = false;
    }
  }

  async function fetchMoreDelegates(orderBy: string) {
    if (!delegates.value.length || isLoadingMoreDelegates.value) return;
    isLoadingMoreDelegates.value = true;

    try {
      const response = await fetchDelegateBatch(
        orderBy,
        delegates.value.length
      );
      delegates.value = [...delegates.value, ...response];
      hasMoreDelegates.value = response.length === DELEGATES_LIMIT;
    } catch (err) {
      console.error(err);
      hasDelegatesLoadFailed.value = true;
    } finally {
      isLoadingMoreDelegates.value = false;
    }
  }

  async function loadDelegate(addressOrEns: string) {
    hasDelegatesLoadFailed.value = false;

    if (isLoadingDelegate.value) return;
    delegate.value = null;
    isLoadingDelegate.value = true;
    try {
      resolvedAddress.value = await resolveName(addressOrEns);
      if (!resolvedAddress.value) return;
      const response = await reader.getDelegate(resolvedAddress.value);
      delegate.value = response;
    } catch (err) {
      console.error(err);
      hasDelegatesLoadFailed.value = true;
    } finally {
      isLoadingDelegate.value = false;
    }
  }

  async function loadDelegateBalance(id: string) {
    try {
      isLoadingDelegateBalance.value = true;
      return await reader.getBalance(id.toLowerCase());
    } catch (err) {
      console.error(err);
    } finally {
      isLoadingDelegateBalance.value = false;
    }
  }

  async function setDelegates(
    addresses: string[],
    ratio?: number[],
    expirationTimestamp?: number
  ) {
    return writer.sendSetDelegationTx(addresses, ratio, expirationTimestamp);
  }

  async function fetchDelegatingTo(address: string) {
    if (!address) return;
    isLoadingDelegatingTo.value = true;
    try {
      return await reader.getDelegatingTo(address);
    } catch (err) {
      console.error(err);
    } finally {
      isLoadingDelegatingTo.value = false;
    }
  }

  async function fetchDelegateVotesAndProposals(
    space: string,
    delegates: string[]
  ) {
    const filteredDelegates = delegates.filter(
      delegate => !delegatesStats.value[delegate]
    );

    const response: { votes: DelegatesVote[]; proposals: DelegatesProposal[] } =
      await apolloQuery({
        query: DELEGATE_VOTES_AND_PROPOSALS,
        variables: {
          delegates: filteredDelegates,
          space
        }
      });

    if (!response) return {};

    const votesAndProposals: DelegatesStats = {};

    filteredDelegates.forEach(delegate => {
      votesAndProposals[delegate] = {
        votes: [],
        proposals: []
      };
    });

    response.votes.forEach(vote => {
      const delegate = vote.voter.toLowerCase();
      votesAndProposals[delegate]?.votes.push(vote);
    });

    response.proposals.forEach(proposal => {
      const delegate = proposal.author.toLowerCase();
      votesAndProposals[delegate]?.proposals.push(proposal);
    });

    delegatesStats.value = {
      ...delegatesStats.value,
      ...votesAndProposals
    };
  }

  return {
    isLoadingDelegate,
    isLoadingDelegates,
    isLoadingMoreDelegates,
    hasDelegatesLoadFailed,
    isLoadingDelegateBalance,
    isLoadingDelegatingTo,
    hasMoreDelegates,
    delegate,
    delegates,
    delegatesStats,
    loadDelegate,
    loadDelegates,
    fetchMoreDelegates,
    setDelegates,
    loadDelegateBalance,
    fetchDelegateVotesAndProposals,
    fetchDelegatingTo
  };
}
