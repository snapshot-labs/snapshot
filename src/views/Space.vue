<template>
  <Container :slim="true">
    <div class="mx-4 mx-md-0 d-flex flex-justify-between mb-3 hide-xl">
      <div v-text="showMenu ? '' : space.name" />
      <Icon
        :name="showMenu ? 'close' : 'menu1'"
        size="25"
        class="menu-btn v-align-text-bottom text-white"
        @click="handleMenuToggle"
      />
    </div>
    <div
      :class="
        'col-12 col-lg-3 float-left ' +
        (showMenu ? 'anim-fade-in' : 'hide-sm hide-md hide-lg')
      "
    >
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
  data() {
    return {
      showMenu: false
    };
  },
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
      space
    };
  },
  methods: {
    handleMenuToggle() {
      this.showMenu = !this.showMenu;
    }
  }
};
</script>
<style>
.menu-btn {
  cursor: pointer;
}
</style>
