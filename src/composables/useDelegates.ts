import { subgraphRequest } from '@snapshot-labs/snapshot.js/src/utils';

type ApiDelegate = {
  id: string;
  delegatedVotes: string;
  delegatedVotesRaw: string;
  tokenHoldersRepresentedAmount: number;
};

type Delegate = ApiDelegate & {
  delegatorsPercentage: number;
  votesPercentage: number;
};

type Governance = {
  delegatedVotes: string;
  totalTokenHolders: string;
  totalDelegates: string;
};

const DELEGATES_LIMIT = 50;

function adjustUrl(apiUrl: string) {
  const hostedPattern =
    /https:\/\/thegraph\.com\/hosted-service\/subgraph\/([\w-]+)\/([\w-]+)/;

  const hostedMatch = apiUrl.match(hostedPattern);
  if (hostedMatch) {
    return `https://api.thegraph.com/subgraphs/name/${hostedMatch[1]}/${hostedMatch[2]}`;
  }

  return apiUrl;
}

export function useDelegates() {
  const delegates: Ref<Delegate[]> = ref([]);
  const isLoadingDelegates = ref(false);
  const isLoadingMoreDelegates = ref(false);
  const loadedDelegates = ref(false);
  const hasDelegatesLoadFailed = ref(false);
  const hasMoreDelegates = ref(false);

  async function _fetchDelegates(overwrite: boolean) {
    const query = {
      delegates: {
        __args: {
          first: DELEGATES_LIMIT,
          skip: overwrite ? 0 : delegates.value.length
        },
        id: true,
        delegatedVotes: true,
        delegatedVotesRaw: true,
        tokenHoldersRepresentedAmount: true
      },
      governance: {
        __args: {
          id: 'GOVERNANCE'
        },
        delegatedVotes: true,
        totalTokenHolders: true,
        totalDelegates: true
      }
    };

    const data = await subgraphRequest(
      adjustUrl(
        'https://thegraph.com/hosted-service/subgraph/arr00/uniswap-governance-v2'
      ),
      query
    );
    console.log(
      '🚀 ~ file: useDelegates.ts:92 ~ _fetchDelegates ~ data:',
      data
    );

    const governanceData = data.governance as Governance;
    const delegatesData = data.delegates as ApiDelegate[];

    const newDelegates = delegatesData.map((delegate: ApiDelegate) => {
      const delegatorsPercentage =
        (Number(delegate.tokenHoldersRepresentedAmount) /
          Number(governanceData.totalTokenHolders)) *
        100;
      const votesPercentage =
        (Number(delegate.delegatedVotes) /
          Number(governanceData.delegatedVotes)) *
        100;

      return {
        ...delegate,
        delegatorsPercentage,
        votesPercentage
      };
    });

    delegates.value = overwrite
      ? newDelegates
      : [...delegates.value, ...newDelegates];

    hasMoreDelegates.value = delegatesData.length === DELEGATES_LIMIT;
  }

  async function fetchDelegates() {
    if (isLoadingDelegates.value || loadedDelegates.value) return;
    isLoadingDelegates.value = true;

    try {
      await _fetchDelegates(true);

      loadedDelegates.value = true;
    } catch (err) {
      hasDelegatesLoadFailed.value = true;
    } finally {
      isLoadingDelegates.value = false;
    }
  }

  async function fetchMoreDelegates() {
    if (isLoadingDelegates.value || !loadedDelegates.value) return;
    isLoadingMoreDelegates.value = true;

    await _fetchDelegates(false);

    isLoadingMoreDelegates.value = false;
  }

  return {
    isLoadingDelegates,
    isLoadingMoreDelegates,
    loadedDelegates,
    hasDelegatesLoadFailed,
    hasMoreDelegates,
    delegates,
    fetchDelegates,
    fetchMoreDelegates
  };
}
