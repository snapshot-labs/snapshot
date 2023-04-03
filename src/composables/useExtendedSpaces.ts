import { SPACES_QUERY } from '@/helpers/queries';
import { ExtendedSpace } from '@/helpers/interfaces';
import { mapOldPluginNames } from '@/helpers/utils';

const extendedSpaces = ref<ExtendedSpace[]>([]);

export function useExtendedSpaces() {
  const loading = ref(false);

  const { apolloQuery } = useApolloQuery();
  async function loadExtendedSpaces(id_in: string[] = []) {
    const filteredLoadedSpaces = id_in.filter(
      id => !extendedSpaces.value?.find(space => space.id === id)
    );
    if (!filteredLoadedSpaces.length) return;

    loading.value = true;
    try {
      const spaces = await apolloQuery(
        {
          query: SPACES_QUERY,
          variables: {
            id_in: filteredLoadedSpaces
          }
        },
        'spaces'
      );

      const mappedSpaces = spaces.map(mapOldPluginNames);
      extendedSpaces.value = [...extendedSpaces.value, ...mappedSpaces];

      // Remove any duplicates incase two requests were made at the same time
      extendedSpaces.value = extendedSpaces.value.filter(
        (space, index, self) => index === self.findIndex(t => t.id === space.id)
      );

      loading.value = false;
    } catch (e) {
      loading.value = false;
      console.error(e);
      return e;
    }
  }

  async function reloadSpace(id: string) {
    try {
      const space = await apolloQuery(
        {
          query: SPACES_QUERY,
          variables: {
            id_in: [id]
          }
        },
        'spaces'
      );
      space.map(mapOldPluginNames);

      extendedSpaces.value = extendedSpaces.value.filter(
        s => s.id !== space[0].id
      );
      extendedSpaces.value = [...extendedSpaces.value, ...space];
    } catch (e) {
      console.error(e);
      return e;
    }
  }

  return {
    loadExtendedSpaces,
    reloadSpace,
    extendedSpaces: computed(() => extendedSpaces.value),
    spaceLoading: computed(() => loading.value)
  };
}
