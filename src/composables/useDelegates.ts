import {
  DelegateWithPercent,
  DelegatesVote,
  DelegatesProposal,
  ExtendedSpace
} from '@/helpers/interfaces';
import { createStandardConfig } from '@/helpers/delegation/index';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { DELEGATE_VOTES_AND_PROPOSALS } from '@/helpers/queries';
import {
  subgraphRequest,
  sendTransaction
} from '@snapshot-labs/snapshot.js/src/utils';
import { call } from '@snapshot-labs/snapshot.js/src/utils';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';

type DelegatesStats = Record<
  string,
  { votes: DelegatesVote[]; proposals: DelegatesProposal[] }
>;

const DELEGATES_LIMIT = 18;

function adjustUrl(apiUrl: string) {
  const hostedPattern =
    /https:\/\/thegraph\.com\/hosted-service\/subgraph\/([\w-]+)\/([\w-]+)/;
  const hostedMatch = apiUrl.match(hostedPattern);

  return hostedMatch
    ? `https://api.thegraph.com/subgraphs/name/${hostedMatch[1]}/${hostedMatch[2]}`
    : apiUrl;
}

export function useDelegates(space: ExtendedSpace) {
  const { resolveName } = useResolveName();
  const { apolloQuery } = useApolloQuery();
  const auth = getInstance();
  const { loadStatements } = useStatement();
  const { loadProfiles } = useProfiles();

  const standardConfig = createStandardConfig(
    space.delegationPortal.delegationType
  );

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

  async function loadExtraDelegateData(spaceId: string, delegates: string[]) {
    loadProfiles(delegates);
    await Promise.all([
      fetchDelegateVotesAndProposals(spaceId, delegates),
      loadStatements(spaceId, delegates)
    ]);
  }

  async function fetchDelegateBatch(orderBy: string, skip = 0) {
    hasDelegatesLoadFailed.value = false;

    const query: any = standardConfig.getDelegatesQuery({
      skip,
      first: DELEGATES_LIMIT,
      orderBy
    });

    const response = await subgraphRequest(
      adjustUrl(space.delegationPortal.delegationApi),
      query
    );

    const formattedResponse = standardConfig.formatDelegatesResponse(response);

    await loadExtraDelegateData(
      space.id,
      formattedResponse.map(d => d.id)
    );

    return formattedResponse;
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

  async function loadDelegate(id: string) {
    hasDelegatesLoadFailed.value = false;

    if (isLoadingDelegate.value) return;
    delegate.value = null;
    isLoadingDelegate.value = true;
    try {
      resolvedAddress.value = await resolveName(id);

      if (!resolvedAddress.value) return;
      const query: any = standardConfig.getDelegateQuery(resolvedAddress.value);

      const response = await subgraphRequest(
        adjustUrl(space.delegationPortal.delegationApi),
        query
      );

      if (resolvedAddress.value && !response.delegate)
        response.delegate = standardConfig.initEmptyDelegate(
          resolvedAddress.value
        );

      if (response.delegate) {
        delegate.value = standardConfig.formatDelegateResponse(response);
        await loadExtraDelegateData(space.id, [delegate.value.id]);
      }
    } catch (err) {
      console.error(err);
      hasDelegatesLoadFailed.value = true;
    } finally {
      isLoadingDelegate.value = false;
    }
  }

  async function loadDelegateBalance(id: string) {
    const query: any = standardConfig.getBalanceQuery(id.toLowerCase());

    try {
      isLoadingDelegateBalance.value = true;
      const response = await subgraphRequest(
        adjustUrl(space.delegationPortal.delegationApi),
        query
      );
      return standardConfig.formatBalanceResponse(response);
    } catch (err) {
      console.error(err);
    } finally {
      isLoadingDelegateBalance.value = false;
    }
  }

  async function setDelegate(address: string) {
    const contractMethod = standardConfig.getContractDelegateMethod();
    const tx = await sendTransaction(
      auth.web3,
      space.delegationPortal.delegationContract,
      contractMethod.abi,
      contractMethod.action,
      [address]
    );
    return tx;
  }

  async function fetchDelegatingTo(address: string) {
    if (!address) return;
    isLoadingDelegatingTo.value = true;
    try {
      const broviderUrl = import.meta.env.VITE_BROVIDER_URL;
      const contractMethod = standardConfig.getContractDelegatingToMethod();
      const provider = getProvider(space.network, { broviderUrl });
      return await call(provider, contractMethod.abi, [
        space.delegationPortal.delegationContract,
        contractMethod.action,
        [address]
      ]);
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
    setDelegate,
    loadDelegateBalance,
    fetchDelegateVotesAndProposals,
    fetchDelegatingTo
  };
}
