<template>
  <Container :slim="true">
    <div class="col-12 col-lg-3 float-left">
      <BlockSpace :space="space" />
    </div>
    <div :class="'col-12 col-lg-9 float-right pl-0 pl-lg-5'">
      <router-view :space="space" />
    </div>
  </Container>
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
