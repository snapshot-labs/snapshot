import { ref, computed } from 'vue';
import { SPACES_QUERY } from '@/helpers/queries';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { ExtendedSpace } from '@/helpers/interfaces';
import { mapOldPluginNames } from '@/helpers/utils';

const extentedSpaces = ref<ExtendedSpace[]>([]);
const loading = ref(false);

export function useExtendedSpaces() {
  const { apolloQuery } = useApolloQuery();

  async function loadExtentedSpaces(id_in: string[] = []) {
    const filteredLoadedSpaces = id_in.filter(
      id => !extentedSpaces.value?.find(space => space.id === id)
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
      extentedSpaces.value = [...extentedSpaces.value, ...mappedSpaces];

      loading.value = false;
    } catch (e) {
      loading.value = false;
      console.error(e);
      return e;
    }
  }

  const reloadSpace = (id: string) => {
    const spaceToReload = extentedSpaces.value?.find(space => space.id === id);
    if (spaceToReload) {
      extentedSpaces.value = extentedSpaces.value.filter(
        space => space.id !== id
      );
      loadExtentedSpaces([id]);
    }
  };

  return {
    loadExtentedSpaces,
    reloadSpace,
    extentedSpaces: computed(() => extentedSpaces.value),
    spaceLoading: computed(() => loading.value)
  };
}
