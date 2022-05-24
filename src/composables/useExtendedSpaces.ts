import { ref, computed } from 'vue';
import { SPACES_QUERY } from '@/helpers/queries';
import { useApolloQuery } from '@/composables/useApolloQuery';

const extentedSpaces = ref<Record<string, any>[]>([]);
const loading = ref(false);

export function useExtendedSpaces() {
  const { apolloQuery } = useApolloQuery();

  async function loadExtentedSpaces(id_in: string[] = []) {
    const filteredLoadedSpaces = id_in.filter(
      id => !extentedSpaces.value?.find(space => space.id === id)
    );

    loading.value = true;
    try {
      const response = await apolloQuery(
        {
          query: SPACES_QUERY,
          variables: {
            id_in: filteredLoadedSpaces
          }
        },
        'spaces'
      );

      extentedSpaces.value = [...extentedSpaces.value, ...response];
      loading.value = false;
    } catch (e) {
      loading.value = false;
      console.error(e);
      return e;
    }
  }

  return {
    loadExtentedSpaces,
    extentedSpaces: computed(() => extentedSpaces.value),
    spaceLoading: computed(() => loading.value)
  };
}
