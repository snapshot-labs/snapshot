import { RankedSpace, Space } from '@/helpers/interfaces';
import { SPACES_QUERY, SPACES_RANKING_QUERY } from '@/helpers/queries';

interface Metrics {
  total: number;
  categories: Record<string, number>;
}

export function useSpaces() {
  const { apolloQuery } = useApolloQuery();

  const loadingSpacesHome = ref(false);
  const loadingMoreSpacesHome = ref(false);
  const spacesHome = ref<RankedSpace[]>([]);
  const spacesHomeMetrics = ref<Metrics>({ total: 0, categories: {} });
  const enableSpaceHomeScroll = ref(false);

  const loadingSpacesRanking = ref(false);
  const loadingMoreSpacesRanking = ref(false);
  const spacesRanking = ref<RankedSpace[]>([]);
  const spacesRankingMetrics = ref<Metrics>({ total: 0, categories: {} });

  const isLoadingSpaces = ref(false);
  const isLoadingDeletedSpaces = ref(false);
  const spaces = ref<Space[]>([]);

  function _fetchRankedSpaces(variables: any = {}, skip = 0) {
    return apolloQuery(
      {
        query: SPACES_RANKING_QUERY,
        variables: {
          skip,
          first: 12,
          private: false,
          search: variables.search || undefined,
          network: variables.network || undefined,
          category: variables.category || undefined
        }
      },
      'ranking'
    );
  }

  async function loadSpacesHome(variables?: any) {
    if (loadingSpacesHome.value) return;
    loadingSpacesHome.value = true;
    try {
      const response = await _fetchRankedSpaces(variables);

      if (!response) return;

      spacesHome.value = response.items || [];
      spacesHomeMetrics.value = response.metrics as Metrics;

      loadingSpacesHome.value = false;
    } catch (e) {
      console.error(e);
    } finally {
      loadingSpacesHome.value = false;
    }
  }

  async function loadMoreSpacesHome(variables?: any) {
    if (
      loadingMoreSpacesHome.value ||
      spacesHomeMetrics.value.total <= spacesHome.value.length
    )
      return;
    loadingMoreSpacesHome.value = true;
    try {
      const response = await _fetchRankedSpaces(
        variables,
        spacesHome.value.length
      );

      if (!response) return;

      spacesHome.value = [...spacesHome.value, ...response.items];
      spacesHomeMetrics.value = response.metrics as Metrics;

      loadingMoreSpacesHome.value = false;
    } catch (e) {
      console.error(e);
    } finally {
      loadingMoreSpacesHome.value = false;
    }
  }

  async function loadSpacesRanking(variables?: any) {
    if (loadingSpacesRanking.value) return;
    loadingSpacesRanking.value = true;
    try {
      const response = await _fetchRankedSpaces(variables);

      if (!response) return;

      spacesRanking.value = response.items;
      spacesRankingMetrics.value = response.metrics as Metrics;

      loadingSpacesRanking.value = false;
    } catch (e) {
      console.error(e);
    } finally {
      loadingSpacesRanking.value = false;
    }
  }

  async function loadMoreSpacesRanking(variables?: any) {
    if (
      loadingMoreSpacesRanking.value ||
      spacesRankingMetrics.value.total <= spacesRanking.value.length
    )
      return;
    loadingMoreSpacesRanking.value = true;
    try {
      const response = await _fetchRankedSpaces(
        variables,
        spacesRanking.value.length
      );

      if (!response) return;

      spacesRanking.value = [...spacesRanking.value, ...response.items];
      spacesRankingMetrics.value = response.metrics as Metrics;

      loadingMoreSpacesRanking.value = false;
    } catch (e) {
      console.error(e);
    } finally {
      loadingMoreSpacesRanking.value = false;
    }
  }

  async function loadSpaces(id_in: string[]) {
    if (isLoadingSpaces.value || !id_in.length) return;

    isLoadingSpaces.value = true;
    try {
      const response = await apolloQuery(
        {
          query: SPACES_QUERY,
          variables: {
            id_in,
            skip: 0,
            first: 1000
          }
        },
        'spaces'
      );

      if (!response) return;

      spaces.value = response;

      isLoadingSpaces.value = false;
    } catch (e) {
      console.error(e);
    } finally {
      isLoadingSpaces.value = false;
    }
  }

  async function getDeletedSpaces(ids: string[]) {
    isLoadingDeletedSpaces.value = true;
    const results = await Promise.allSettled(
      ids.map(async id => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_HUB_URL}/api/spaces/${id}`,
            {
              headers: { 'Content-Type': 'application/json' }
            }
          );

          return (await response.json())?.deleted === true ? id : null;
        } catch (e) {
          console.error(e);
          return null;
        }
      })
    );
    isLoadingDeletedSpaces.value = false;

    return results.map(r => r.value).filter(a => a);
  }

  return {
    loadSpaces,
    loadSpacesHome,
    loadMoreSpacesHome,
    loadSpacesRanking,
    loadMoreSpacesRanking,
    getDeletedSpaces,
    spaces,
    spacesHome,
    spacesHomeMetrics,
    isLoadingSpaces,
    isLoadingDeletedSpaces,
    loadingSpacesHome,
    loadingMoreSpacesHome,
    enableSpaceHomeScroll,
    spacesRanking,
    spacesRankingMetrics,
    loadingSpacesRanking,
    loadingMoreSpacesRanking
  };
}
