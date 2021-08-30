import { ref, computed } from 'vue';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { SPACES_QUERY } from '@/helpers/queries';

const spaces: any = ref([]);

export function useSpaces() {
  const spacesLoading = ref(true);

  const { apolloQuery } = useApolloQuery();

  async function getSpaces(id_in: any = []) {
    if (!spaces.value.some((s: any) => id_in.includes(s.id))) {
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
        spaces.value = response.concat(spaces.value);
      } catch (e) {
        console.error(e);
      }
    }
  }

  return {
    getSpaces,
    spacesLoading,
    spaces: computed(() => spaces.value)
  };
}
