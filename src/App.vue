<template>
  <div :class="space && space.skin" id="app" class="overflow-hidden">
    <UiLoading v-if="app.loading || !app.init" class="overlay big" />
    <div v-else>
      <Topnav />
      <div class="pb-6 overflow-hidden">
        <router-view :key="$route.path" class="flex-auto" />
      </div>
    </div>
    <div id="modal" />
    <Notifications />
  </div>
</template>

<script>
import { onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useModal } from '@/composables/useModal';
import { useI18n } from '@/composables/useI18n';

export default {
  setup() {
    const store = useStore();
    const { modalOpen } = useModal();
    const { loadLocale } = useI18n();

    onMounted(async () => {
      await loadLocale();
      store.dispatch('init');
    });

    watch(modalOpen, val => {
      const el = document.body;
      el.classList[val ? 'add' : 'remove']('overflow-hidden');
    });
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
  }
};
</script>
