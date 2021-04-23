import { useRoute } from 'vue-router';

import { computed } from 'vue';

export function routeState() {
  const route = useRoute();

  const routeName = computed(() => route.name);
  const routeQuery = computed(() => route.query);

  return { routeQuery, routeName };
}
