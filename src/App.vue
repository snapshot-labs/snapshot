<script setup>
import { onMounted, provide, watch } from 'vue';
import { useModal } from '@/composables/useModal';
import { useI18n } from '@/composables/useI18n';
import { useApp } from '@/composables/useApp';
import { useWeb3 } from '@/composables/useWeb3';
import { useNotifications } from '@/composables/useNotifications';
import { useSpace } from '@/composables/useSpace';

const { loadLocale } = useI18n();
const { modalOpen } = useModal();
const { init, app } = useApp();
const { web3 } = useWeb3();
const { notify } = useNotifications();
const { space, spaceLoading } = useSpace();

provide('web3', web3);
provide('notify', notify);
provide('space', space);

onMounted(async () => {
  await loadLocale();
  init();
});

watch(modalOpen, val => {
  const el = document.body;
  el.classList[val ? 'add' : 'remove']('overflow-hidden');
});
</script>

<template>
  <div :class="space?.skin" id="app" class="overflow-hidden pb-4">
    <UiLoading
      v-if="app.loading || !app.init || spaceLoading"
      class="overlay big"
    />
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
