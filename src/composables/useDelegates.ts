import { DelegateWithPercent } from '@/helpers/interfaces';
import { createStandardConfig } from '@/helpers/delegation/index';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import {
  subgraphRequest,
  sendTransaction
} from '@snapshot-labs/snapshot.js/src/utils';

type QueryVariables = {
  id: string;
  orderBy?: string;
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

export function useDelegates(delegatesConfig: DelegatesConfig) {
  const { resolveName } = useResolveName();
  const auth = getInstance();

  const standardConfig = createStandardConfig(delegatesConfig.standard);

  const delegates: Ref<DelegateWithPercent[]> = ref([]);
  const isLoadingDelegates = ref(false);
  const isLoadingMoreDelegates = ref(false);
  const hasDelegatesLoadFailed = ref(false);
  const hasMoreDelegates = ref(false);
  const resolvedAddress = ref<string | null>(null);

  async function _fetchDelegates(queryVariables: QueryVariables, skip = 0) {
    const query: any = standardConfig.getDelegatesQuery({
      skip,
      first: DELEGATES_LIMIT,
      orderBy: queryVariables.orderBy || undefined,
      id: resolvedAddress.value ? resolvedAddress.value : queryVariables.id
    });

    const response = await subgraphRequest(
      adjustUrl(delegatesConfig.subgraphUrl),
      query
    );

    return standardConfig.formatDelegatesResponse(response);
  }

  async function fetchDelegates(variables: QueryVariables) {
    if (isLoadingDelegates.value) return;
    isLoadingDelegates.value = true;

    try {
      resolvedAddress.value = await resolveName(variables.id || '');

      let response = await _fetchDelegates(variables);

      if (resolvedAddress.value && !response.length)
        response = standardConfig.initializeUser(resolvedAddress.value);

      delegates.value = response;

      hasMoreDelegates.value = response.length === DELEGATES_LIMIT;
    } catch (err) {
      console.error(err);
      hasDelegatesLoadFailed.value = true;
    } finally {
      isLoadingDelegates.value = false;
    }
  }

  async function fetchMoreDelegates(variables: QueryVariables) {
    if (!delegates.value.length || isLoadingMoreDelegates.value) return;
    isLoadingMoreDelegates.value = true;

    try {
      const response = await _fetchDelegates(variables, delegates.value.length);

      delegates.value = [...delegates.value, ...response];

      hasMoreDelegates.value = response.length === DELEGATES_LIMIT;
    } catch (err) {
      console.error(err);
      hasDelegatesLoadFailed.value = true;
    } finally {
      isLoadingMoreDelegates.value = false;
    }
  }

  async function fetchDelegate(id: string) {
    const query: any = standardConfig.getDelegateQuery(id.toLowerCase());

    const response = await subgraphRequest(
      adjustUrl(delegatesConfig.subgraphUrl),
      query
    );

    return standardConfig.formatDelegateResponse(response);
  }

  async function setDelegate(address: string) {
    const contractMethod = standardConfig.getContractDelegateMethod();
    const tx = await sendTransaction(
      auth.web3,
      delegatesConfig.contract,
      contractMethod.abi,
      contractMethod.action,
      [address]
    );
    return tx;
  }

  return {
    isLoadingDelegates,
    isLoadingMoreDelegates,
    hasDelegatesLoadFailed,
    hasMoreDelegates,
    delegates,
    setDelegate,
    fetchDelegates,
    fetchMoreDelegates,
    fetchDelegate
  };
}
