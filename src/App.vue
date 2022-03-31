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
  <LoadingSpinner v-if="!ready" class="overlay big" />
  <div
    v-else
    class="flex font-sans text-base antialiased bg-skin-bg text-skin-text min-h-screen"
  >
    <div
      v-if="!domain"
      id="sidebar"
      class="flex flex-col"
    >
      <div
        class="h-screen sticky top-0 bg-skin-bg z-40 overflow-hidden max-w-[60px] sm:w-auto transition-all"
        :class="{ 'max-w-0 sm:max-w-none': !showSidebar }"
      >
        <TheSidebar class="border-r border-skin-border" />
      </div>
    </div>
    <div class="flex flex-col min-w-0 w-screen shrink-0 sm:w-auto sm:shrink sm:grow">
      <div
        id="navbar"
        class="sticky top-0 border-b border-skin-border bg-skin-bg z-40"
      >
        <TheNavbar />
      </div>
      <div id="content" class="pb-6 pt-4">
        <router-view :key="$route.path" />
      </div>
      <footer class="mt-auto" v-if="route.name === 'home'">
        <TheFooter />
      </footer>
    </div>
  </div>
  <FlashNotification />
</template>
