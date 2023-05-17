import { SPACE_QUERY } from '@/helpers/queries';
import { ExtendedSpace } from '@/helpers/interfaces';
import { mapOldPluginNames } from '@/helpers/utils';

const extendedSpaces = ref<ExtendedSpace[]>([]);

export function useExtendedSpaces() {
  const loading = ref(false);

  const { apolloQuery } = useApolloQuery();
  async function loadExtendedSpace(spaceId: string) {
    if (!spaceId || extendedSpaces.value.some(s => s.id === spaceId)) return;

    loading.value = true;
    try {
      const response = await apolloQuery(
        {
          query: SPACE_QUERY,
          variables: {
            id: spaceId
          }
        },
        'space'
      );

      const mappedSpace = mapOldPluginNames(response);
      extendedSpaces.value.push(mappedSpace);

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

  async function reloadSpace(spaceId: string) {
    try {
      const response = await apolloQuery(
        {
          query: SPACE_QUERY,
          variables: {
            id: spaceId
          }
        },
        'space'
      );
      const mappedSpace = mapOldPluginNames(response);

      extendedSpaces.value = extendedSpaces.value.filter(
        s => s.id !== mappedSpace.id
      );

      extendedSpaces.value.push(mappedSpace);
    } catch (e) {
      console.error(e);
      return e;
    }
  }

  function deleteSpace(id: string) {
    extendedSpaces.value = extendedSpaces.value.filter(s => s.id !== id);
  }

  return {
    loadExtendedSpace,
    reloadSpace,
    deleteSpace,
    extendedSpaces: computed(() => extendedSpaces.value),
    spaceLoading: computed(() => loading.value)
  };
}
