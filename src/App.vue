<script setup lang="ts">
import { useStorage } from '@vueuse/core';

const { domain, init, isReady, showSidebar } = useApp();
const route = useRoute();
const { restorePendingTransactions } = useTxStatus();

onMounted(async () => {
  await init();
  restorePendingTransactions();
});
const bannerClosed = useStorage('snapshot.v2-banner-closed', false);
const showBanner = computed(() => {
  const showInPages = ['home', 'timeline'];
  return showInPages.includes(route.name as string) && !bannerClosed.value;
});
</script>

<template>
  <LoadingSpinner v-if="!isReady" class="overlay big animate-fade-in" />
  <div v-else class="flex min-h-screen">
    <div v-if="!domain" id="sidebar" class="flex flex-col">
      <div
        class="sticky top-0 z-40 h-screen overflow-hidden bg-skin-bg transition-all sm:w-[60px]"
        :class="{ 'max-w-0 sm:max-w-none': !showSidebar }"
      >
        <TheSidebar class="border-r border-skin-border" />
      </div>
    </div>
    <div
      class="relative flex w-screen min-w-0 shrink-0 flex-col sm:w-auto sm:shrink sm:grow"
    >
      <div
        class="absolute bottom-0 left-0 right-0 top-0 z-50 bg-skin-bg opacity-60"
        :class="{ hidden: !showSidebar }"
        @click="showSidebar = false"
      />
      <div
        id="navbar"
        class="sticky top-0 z-40 border-b border-skin-border bg-skin-bg"
      >
        <TheNavbar />
      </div>
      <div
        v-if="showBanner"
        class="relative flex items-center justify-center gap-1 mb-2 bg-purple-300/20 text-purple-400 px-3 py-2"
      >
        <i-ho-speakerphone class="shrink-0" />
        <div class="leading-6">
          Snapshot v2 is now available at
          <a
            class="text-purple-400 underline font-semibold"
            href="https://snapshot.box/#/home"
            >snapshot.box</a
          >
        </div>
        <button class="xs:absolute xs:right-3" @click="bannerClosed = true">
          <i-ho-x />
        </button>
      </div>
      <div id="content" class="pb-6 pt-4">
        <router-view v-slot="{ Component }">
          <KeepAlive :include="['ExploreView', 'RankingView']">
            <component :is="Component" :key="route.path" />
          </KeepAlive>
        </router-view>
      </div>
      <footer
        v-if="route.name === 'home' || route.name === 'terms-and-conditions'"
        class="mt-auto"
      >
        <TheFooter />
      </footer>
      <div id="action-bar" />
    </div>
  </div>
  <TheFlashNotification />
  <TheModalNotification />
</template>
