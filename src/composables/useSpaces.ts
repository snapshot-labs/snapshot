import client from '@/helpers/client';

import { onMounted, ref } from 'vue';
const spaces = ref({});

export function useSpaces() {
  function formatSpace(key, space) {
    space = {
      key,
      ...space,
      members: space.members || [],
      filters: space.filters || {}
    };
    if (!space.filters.invalids) space.filters.invalids = [];
    if (!space.filters.minScore) space.filters.minScore = 0;
    return space;
  }

  async function getSpaces() {
    let spaces: any = await client.getSpaces();
    spaces = Object.fromEntries(
      Object.entries(spaces).map(space => [
        space[0],
        formatSpace(space[0], space[1])
      ])
    );

    return spaces;
  }

  onMounted(async () => {
    spaces.value = await getSpaces();
  });

  return { spaces, formatSpace, getSpaces };
}
