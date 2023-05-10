import { Space } from '@/helpers/interfaces';
import { SPACES_QUERY } from '@/helpers/queries';

export function useSpaces() {
  const { apolloQuery } = useApolloQuery();

  const isLoadingSpacesHome = ref(false);
  const isLoadingMoreSpacesHome = ref(false);
  const spacesHome = ref<Space[]>([]);
  const spacesHomeTotal = ref(0);

  const isLoadingSpaces = ref(false);
  const spaces = ref<Space[]>([]);

  function spacesHomeQuery(variables: any = {}, skip = 0) {
    return apolloQuery(
      {
        query: SPACES_QUERY,
        variables: {
          skip: skip,
          first: 12,
          private: false,
          search: variables.search || undefined,
          network: variables.network || undefined,
          category: variables.category || undefined
        }
      },
      'spaces'
    );
  }

  async function loadSpacesHome(variables: any = {}) {
    if (isLoadingSpacesHome.value) return;
    isLoadingSpacesHome.value = true;
    try {
      const response = await spacesHomeQuery(variables);

      if (!response) return;

      spacesHome.value = response.items;
      spacesHomeTotal.value = response.total;

      isLoadingSpacesHome.value = false;
    } catch (e) {
      isLoadingSpacesHome.value = false;
      console.error(e);
    } finally {
      isLoadingSpacesHome.value = false;
    }
  }

  async function loadMoreSpaceHome(variables: any, skip: number) {
    if (isLoadingMoreSpacesHome.value || spacesHomeTotal.value <= skip) return;
    isLoadingMoreSpacesHome.value = true;
    try {
      const response = await spacesHomeQuery(variables, skip);

      if (!response) return;

      spacesHome.value = [...spacesHome.value, ...response.items];

      isLoadingMoreSpacesHome.value = false;
    } catch (e) {
      isLoadingMoreSpacesHome.value = false;
      console.error(e);
    } finally {
      isLoadingMoreSpacesHome.value = false;
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

      spaces.value = response.items;

      isLoadingSpaces.value = false;
    } catch (e) {
      isLoadingSpaces.value = false;
      console.error(e);
    } finally {
      isLoadingSpaces.value = false;
    }
  }

  return {
    loadSpaces,
    loadSpacesHome,
    loadMoreSpaceHome,
    spaces,
    spacesHome,
    isLoadingSpaces,
    isLoadingSpacesHome,
    isLoadingMoreSpacesHome,
    spacesHomeTotal
  };
}
