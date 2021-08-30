<script setup>
import { computed, onMounted, provide, watch, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { useModal } from '@/composables/useModal';
import { useI18n } from '@/composables/useI18n';
import { useDomain } from '@/composables/useDomain';
import { useApp } from '@/composables/useApp';
import { useWeb3 } from '@/composables/useWeb3';
import { useNotifications } from '@/composables/useNotifications';
import { useSpaces } from '@/composables/useSpaces';

const { domain } = useDomain();
const { loadLocale } = useI18n();
const route = useRoute();
const { modalOpen } = useModal();
const { init, initialSpaces, app, strategies } = useApp();
const { spaces, spacesLoading, getSpaces } = useSpaces();
const { web3 } = useWeb3();
const { notify } = useNotifications();

const key = computed(() => domain || route.params.key);
const space = computed(() => {
  return (
    spaces.value.find(space => space.id === key.value) ??
    initialSpaces.value[key.value] ??
    {}
  );
});

provide('web3', web3);
provide('notify', notify);
provide('space', space);
provide('initialSpaces', initialSpaces);
provide('spaces', spaces);
provide('strategies', strategies);
provide('getSpaces', getSpaces);

onMounted(async () => {
  await loadLocale();
  init();
});

watchEffect(async () => {
  spacesLoading.value = true;
  key.value ? await getSpaces([key.value]) : null;
  spacesLoading.value = false;
});

watch(modalOpen, val => {
  const el = document.body;
  el.classList[val ? 'add' : 'remove']('overflow-hidden');
});
</script>

<template>
  <div :class="space?.skin" id="app" class="overflow-hidden pb-4">
    <UiLoading v-if="app.loading || !app.init" class="overlay big" />
    <div v-else>
      <Topnav />
      <UiLoading v-if="spacesLoading" class="overlay big" />
      <div v-else class="pb-6">
        <router-view :key="$route.path" class="flex-auto" />
      </div>
    </div>
    <div id="modal" />
    <Notifications />
  </div>
</template>
