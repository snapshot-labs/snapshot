<template>
  <div :class="space?.skin" id="app" class="overflow-hidden pb-4">
    <UiLoading v-if="app.loading || !app.init" class="overlay big" />
    <div v-else>
      <Topnav />
      <div class="pb-6">
        <router-view :key="$route.path" class="flex-auto" />
      </div>
    </div>
    <div id="modal" />
    <Notifications />
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import { useModal } from '@/composables/useModal';
import { useI18n } from '@/composables/useI18n';
import { useDomain } from '@/composables/useDomain';

const { domain } = useDomain();
const { loadLocale } = useI18n();
const store = useStore();
const route = useRoute();

const { modalOpen } = useModal();

const space = computed(() => {
  const key = domain || route.params.key;
  return store.state.app.spaces[key] ? store.state.app.spaces[key] : {};
});

onMounted(async () => {
  await loadLocale();
  store.dispatch('init');
});

watch(modalOpen, val => {
  const el = document.body;
  el.classList[val ? 'add' : 'remove']('overflow-hidden');
});
</script>
