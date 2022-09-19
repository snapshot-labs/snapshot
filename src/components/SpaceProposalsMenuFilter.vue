<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();

function setStateFilter(name: string) {
  router.push({
    query: {
      ...route.query,
      ['state']: name
    }
  });
}

const stateFilter = computed(() => route.query.state || 'all');
</script>

<template>
  <BaseMenu
    :items="[
      {
        text: $t('proposals.states.all'),
        action: 'all',
        extras: { selected: stateFilter === 'all' }
      },
      {
        text: $t('proposals.states.active'),
        action: 'active',
        extras: { selected: stateFilter === 'active' }
      },
      {
        text: $t('proposals.states.pending'),
        action: 'pending',
        extras: { selected: stateFilter === 'pending' }
      },
      {
        text: $t('proposals.states.closed'),
        action: 'closed',
        extras: { selected: stateFilter === 'closed' }
      },
      {
        text: $t('proposals.states.core'),
        action: 'core',
        extras: { selected: stateFilter === 'core' }
      }
    ]"
    :selected="$t(`proposals.states.${stateFilter}`)"
    @select="setStateFilter"
  />
</template>
