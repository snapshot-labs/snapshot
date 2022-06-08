<script setup>
import { onMounted, provide } from 'vue';
import { useApp } from '@/composables/useApp';
import { useWeb3 } from '@/composables/useWeb3';
import { useFlashNotification } from '@/composables/useFlashNotification';
import { useRoute } from 'vue-router';

const { domain } = useApp();
const { init, ready, showSidebar } = useApp();
const { web3 } = useWeb3();
const { notify } = useFlashNotification();
const route = useRoute();

provide('web3', web3);
provide('notify', notify);

onMounted(async () => {
  init();
});
</script>

<template>
  <LoadingSpinner v-if="!ready" class="overlay big animate-fade-in" />
  <div
    v-else
    class="flex min-h-screen bg-skin-bg font-sans text-base text-skin-text antialiased"
  >
    <div v-if="!domain" id="sidebar" class="flex flex-col">
      <div
        class="sticky top-0 z-40 h-screen max-w-[60px] overflow-hidden bg-skin-bg transition-all sm:w-auto"
        :class="{ 'max-w-0 sm:max-w-none': !showSidebar }"
      >
        <TheSidebar class="border-r border-skin-border" />
      </div>
    </div>
    <div
      class="flex w-screen min-w-0 shrink-0 flex-col sm:w-auto sm:shrink sm:grow"
    >
      <div
        id="navbar"
        class="sticky top-0 z-40 border-b border-skin-border bg-skin-bg"
      >
        <TheNavbar />
      </div>
      <div id="content" class="pb-6 pt-4">
        <router-view :key="$route.path" />
      </div>
      <footer v-if="route.name === 'home'" class="mt-auto">
        <TheFooter />
      </footer>
    </div>
  </div>
  <BaseFlashNotification />
</template>
