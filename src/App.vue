<template>
  <div :class="space && space.skin" id="app" class="overflow-hidden">
    <UiLoading v-if="app.loading || !app.init" class="overlay big" />
    <div v-else>
      <Topnav />
      <div class="pb-6 overflow-hidden">
        <router-view :key="$route.path" class="flex-auto" />
      </div>
    </div>
    <portal-target name="modal" multiple />
    <Notifications />
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  watch: {
    'app.modalOpen': function(val) {
      const el = document.body;
      el.classList[val ? 'add' : 'remove']('overflow-hidden');
    }
  },
  computed: {
    space() {
      try {
        const key = this.domain || this.$route.params.key;
        return this.app.spaces[key];
      } catch (e) {
        return {};
      }
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    ...mapActions(['init'])
  }
};
</script>
