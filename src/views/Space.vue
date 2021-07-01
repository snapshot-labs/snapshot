<template>
  <Layout>
    <template #sidebar-left>
      <BlockSpace :space="space" />
    </template>
    <template #content-right>
      <router-view :space="space" />
    </template>
  </Layout>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import { useDomain } from '@/composables/useDomain';

export default {
  setup() {
    const store = useStore();
    const route = useRoute();
    const { domain } = useDomain();

    const spaceId = domain || route.params.key;
    const space = computed(() => ({
      id: spaceId,
      ...store.state.app.spaces[spaceId]
    }));

    return {
      space,
      domain
    };
  }
};
</script>
