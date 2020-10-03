<template>
  <div :class="space ? space.key : ''" id="app" class="overflow-hidden">
    <UiLoading v-if="ui.loading || !ui.init" class="overlay big" />
    <div v-else>
      <Topnav />
      <div class="pb-6 overflow-hidden">
        <router-view :key="$route.path" class="flex-auto" />
      </div>
    </div>
    <Notifications />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import spaces from '@/spaces';

export default {
  methods: {
    ...mapActions(['init'])
  },
  mounted() {
    this.init();
  },
  computed: {
    space() {
      try {
        return spaces[this.$route.params.key];
      } catch (e) {
        return {};
      }
    }
  }
};
</script>
