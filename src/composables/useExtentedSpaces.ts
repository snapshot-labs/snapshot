import { ref, computed } from 'vue';
import { SPACES_QUERY } from '@/helpers/queries';
import { useApolloQuery } from '@/composables/useApolloQuery';

const extentedSpaces = ref([]);
const spaceLoading = ref(true);

export function useExtentedSpaces() {
  const { apolloQuery } = useApolloQuery();

  async function getExtentedSpaces(id_in = []) {
    spaceLoading.value = true;
    try {
      const response = await apolloQuery(
        {
          query: SPACES_QUERY,
          variables: {
            id_in
          }
        },
        'spaces'
      );
      extentedSpaces.value = response;
      spaceLoading.value = false;
    } catch (e) {
      console.error(e);
      spaceLoading.value = false;
    }
  }

  return {
    getExtentedSpaces,
    extentedSpaces: computed(() => extentedSpaces.value),
    spaceLoading: computed(() => spaceLoading.value)
  };
}
