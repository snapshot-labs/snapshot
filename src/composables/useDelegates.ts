import { subgraphRequest } from '@snapshot-labs/snapshot.js/src/utils';
import { ApiDelegate, Delegate } from '@/helpers/interfaces';

type Governance = {
  delegatedVotes: string;
  totalTokenHolders: string;
  totalDelegates: string;
};

const DELEGATES_LIMIT = 18;

function adjustUrl(apiUrl: string) {
  const hostedPattern =
    /https:\/\/thegraph\.com\/hosted-service\/subgraph\/([\w-]+)\/([\w-]+)/;

  const hostedMatch = apiUrl.match(hostedPattern);
  if (hostedMatch) {
    return `https://api.thegraph.com/subgraphs/name/${hostedMatch[1]}/${hostedMatch[2]}`;
  }

  return apiUrl;
}

const delegates: Ref<Delegate[]> = ref([]);

export function useDelegates() {
  const isLoadingDelegates = ref(false);
  const isLoadingMoreDelegates = ref(false);
  const hasDelegatesLoadFailed = ref(false);
  const hasMoreDelegates = ref(false);

  async function _fetchDelegates(overwrite: boolean) {
    const query = {
      delegates: {
        __args: {
          first: DELEGATES_LIMIT,
          skip: overwrite ? 0 : delegates.value.length,
          orderBy: 'delegatedVotes',
          orderDirection: 'desc'
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
        votesPercentage,
        statement:
          Math.random() > 0.5
            ? 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero commodi error unde harum facilis eveniet fugit, ut placeat rerum officiis autem.'
            : ''
      };
    });

    delegates.value = overwrite
      ? newDelegates
      : [...delegates.value, ...newDelegates];

    hasMoreDelegates.value = delegatesData.length === DELEGATES_LIMIT;
  }

  async function fetchDelegates() {
    if (isLoadingDelegates.value) return;
    isLoadingDelegates.value = true;

    try {
      await _fetchDelegates(true);
    } catch (err) {
      hasDelegatesLoadFailed.value = true;
    } finally {
      isLoadingDelegates.value = false;
    }
  }

  async function fetchMoreDelegates() {
    if (isLoadingDelegates.value || isLoadingMoreDelegates.value) return;
    isLoadingMoreDelegates.value = true;

    await _fetchDelegates(false);

    isLoadingMoreDelegates.value = false;
  }

  return {
    isLoadingDelegates,
    isLoadingMoreDelegates,
    hasDelegatesLoadFailed,
    hasMoreDelegates,
    delegates,
    fetchDelegates,
    fetchMoreDelegates
  };
}
