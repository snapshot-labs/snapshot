import { useRoute } from 'vue-router';

import { computed } from 'vue';

export function routeState() {
  const route = useRoute();

  const routeName = computed(() => route.name);
  const routeQuery = computed(() => route.query);
  const routeParams = computed(() => route.params);

  return { routeQuery, routeName, routeParams };
}
