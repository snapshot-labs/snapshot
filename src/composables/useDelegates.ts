import { subgraphRequest } from '@snapshot-labs/snapshot.js/src/utils';
import { Delegate } from '@/helpers/interfaces';
import { createStandardConfig } from '@/helpers/delegates';

type QueryVariables = {
  orderBy: string;
  search: string;
};

type DelegatesConfig = {
  standard: string;
  contract: string;
  subgraphUrl: string;
};

const DELEGATES_LIMIT = 18;

function adjustUrl(apiUrl: string) {
  const hostedPattern =
    /https:\/\/thegraph\.com\/hosted-service\/subgraph\/([\w-]+)\/([\w-]+)/;
  const hostedMatch = apiUrl.match(hostedPattern);

  return hostedMatch
    ? `https://api.thegraph.com/subgraphs/name/${hostedMatch[1]}/${hostedMatch[2]}`
    : apiUrl;
}

const delegates: Ref<Delegate[]> = ref([]);

export function useDelegates(delegatesConfig: DelegatesConfig) {
  const { resolveName } = useResolveName();

  const isLoadingDelegates = ref(false);
  const isLoadingMoreDelegates = ref(false);
  const hasDelegatesLoadFailed = ref(false);
  const hasMoreDelegates = ref(false);

  async function _fetchDelegates(
    overwrite: boolean,
    queryVariables: QueryVariables
  ) {
    const address = await resolveName(queryVariables.search);

    const standardConfig = createStandardConfig(delegatesConfig.standard);
    const query: any = standardConfig.getQuery({
      first: DELEGATES_LIMIT,
      skip: overwrite ? 0 : delegates.value.length,
      orderBy: queryVariables.orderBy,
      id: address ? address : ''
    });

    const response = await subgraphRequest(
      adjustUrl(delegatesConfig.subgraphUrl),
      query
    );
    const newDelegates = standardConfig.formatResponse(response);

    delegates.value = overwrite
      ? newDelegates
      : [...delegates.value, ...newDelegates];

    hasMoreDelegates.value = newDelegates.length === DELEGATES_LIMIT;
  }

  async function fetchDelegates(variables: QueryVariables) {
    if (isLoadingDelegates.value) return;
    isLoadingDelegates.value = true;

    try {
      await _fetchDelegates(true, variables);
    } catch (err) {
      console.error(err);
      hasDelegatesLoadFailed.value = true;
    } finally {
      isLoadingDelegates.value = false;
    }
  }

  async function fetchMoreDelegates(variables: QueryVariables) {
    if (isLoadingDelegates.value || isLoadingMoreDelegates.value) return;
    isLoadingMoreDelegates.value = true;

    try {
      await _fetchDelegates(false, variables);
    } catch (err) {
      console.error(err);
      hasDelegatesLoadFailed.value = true;
    } finally {
      isLoadingMoreDelegates.value = false;
    }
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
