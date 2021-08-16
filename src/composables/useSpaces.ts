import { ref, computed, watchEffect, onMounted } from 'vue';
import client from '@/helpers/client';
import { formatSpace } from '@/helpers/utils';
import { useDomain } from '@/composables/useDomain';
import { useRoute } from 'vue-router';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { SPACES_QUERY } from '@/helpers/queries';

const spaces: any = ref([]);
const graphSpaces: any = ref([]);

export function useSpaces(options = { autoLoad: true }) {
  const spacesLoading = ref(false);

  async function getSpaces() {
    try {
      spacesLoading.value = true;
      let spacesObj: any = await client.getSpaces();
      spacesObj = Object.fromEntries(
        Object.entries(spacesObj).map(space => [
          space[0],
          formatSpace(space[0], space[1])
        ])
      );
      const spacesArray = Object.keys(spacesObj).map(s => {
        const obj = spacesObj[s];
        obj.id = s;
        delete obj.key;
        return obj;
      });
      spaces.value = spacesArray;
      spacesLoading.value = false;
    } catch (e) {
      spacesLoading.value = false;
      console.error(e);
    }
  }

  const { domain } = useDomain();
  const route = useRoute();

  const graphSpacesLoading = ref(false);

  const key = computed(() => domain || route.params.key);

  const { apolloQuery } = useApolloQuery();

  async function getGraphSpaces(id_in: any = []) {
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

  watchEffect(() => {
    if (key.value && !spaces.value.find((s: any) => s.id === key.value))
      getGraphSpaces([key.value]);
  });

  if (spaces.value.length < 1 && options.autoLoad) {
    onMounted(async () => getSpaces());
  }

  const space = computed(() => {
    return (
      spaces.value.find((s: any) => s.id === key.value) ??
      graphSpaces.value.find((s: any) => s.id === key.value) ??
      {}
    );
  });

  return {
    getSpaces,
    spaces,
    space,
    spacesLoading,
    graphSpacesLoading
  };
}
