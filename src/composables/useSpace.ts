import { ref, computed, onMounted, watchEffect } from 'vue';
import { useDomain } from '@/composables/useDomain';
import { useRoute } from 'vue-router';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { SPACES_QUERY } from '@/helpers/queries';

const spaces = ref([]);

export function useSpace() {
  const { domain } = useDomain();
  const route = useRoute();

  const spaceLoading = ref(false);

  const key = computed(() => domain || route.params.key);

  const { apolloQuery } = useApolloQuery();

  async function getSpaces(id_in: any = []) {
    if (spaces.value.some((s: any) => s.id === key.value)) {
      return spaces.value.find((s: any) => s.id === key.value);
    } else {
      try {
        spaceLoading.value = true;
        const response = await apolloQuery(
          {
            query: SPACES_QUERY,
            variables: {
              id_in
            }
          },
          'spaces'
        );

        spaceLoading.value = false;
        spaces.value = response.concat(spaces.value);
      } catch (e) {
        spaceLoading.value = false;
        console.error(e);
      }
    }
  }

  watchEffect(() => {
    if (key.value) getSpaces([key.value]);
  });

  const space = computed(
    () => spaces.value.find((s: any) => s.id === key.value) ?? {}
  );

  return {
    spaceLoading,
    space
  };
}
