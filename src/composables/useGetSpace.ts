import { ref, computed, watchEffect } from 'vue';
import { useDomain } from '@/composables/useDomain';
import { useRoute } from 'vue-router';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { SPACES_QUERY } from '@/helpers/queries';

const graphSpaces: any = ref([]);

export function useGetSpace() {
  const { domain } = useDomain();
  const route = useRoute();

  const graphSpacesLoading = ref(false);

  const key = computed(() => domain || route.params.key);

  const { apolloQuery } = useApolloQuery();

  async function getGraphSpace(id_in: any = []) {
    if (graphSpaces.value.some((s: any) => s.id === key.value)) {
      return graphSpaces.value.find((s: any) => s.id === key.value);
    } else {
      try {
        graphSpacesLoading.value = true;
        const response = await apolloQuery(
          {
            query: SPACES_QUERY,
            variables: {
              id_in
            }
          },
          'spaces'
        );
        graphSpacesLoading.value = false;
        graphSpaces.value = response.concat(graphSpaces.value);
      } catch (e) {
        graphSpacesLoading.value = false;
        console.error(e);
      }
    }
  }

  watchEffect(() => getGraphSpace([key.value]));

  return {
    graphSpaces: computed(() => graphSpaces.value)
  };
}
