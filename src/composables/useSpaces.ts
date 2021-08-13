import { computed, onMounted, ref } from 'vue';
import client from '@/helpers/client';
import { formatSpace } from '@/helpers/utils';
import { useDomain } from '@/composables/useDomain';
import { useRoute } from 'vue-router';

const spaces = ref({});

export function useSpaces() {
  const { domain } = useDomain();
  const route = useRoute();

  const key = computed(() => domain || route.params.key);
  const from: any = computed(() => route.params.from);
  const space = computed(() =>
    spaces.value[key.value] ? spaces.value[key.value] : {}
  );
  const spaceFrom = computed(() =>
    spaces.value[from.value] ? spaces.value[from.value] : {}
  );

  const loadingSpaces = ref(false);

  async function getSpaces() {
    try {
      loadingSpaces.value = true;
      let spacesObj: any = await client.getSpaces();
      spacesObj = Object.fromEntries(
        Object.entries(spacesObj).map(space => [
          space[0],
          formatSpace(space[0], space[1])
        ])
      );

      spaces.value = spacesObj;
      loadingSpaces.value = false;
    } catch (e) {
      loadingSpaces.value = false;
      console.error(e);
    }
  }

  if (Object.keys(spaces.value).length < 1) {
    onMounted(async () => getSpaces());
  }

  return {
    getSpaces,
    spaces,
    space,
    spaceFrom,
    loadingSpaces,
    key,
    from
  };
}
