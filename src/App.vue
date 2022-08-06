<script setup>
import { onMounted } from 'vue';
import { useApp } from '@/composables/useApp';
import { useRoute } from 'vue-router';

const { domain } = useApp();
const { init, isReady, showSidebar } = useApp();
const route = useRoute();

onMounted(async () => init());
</script>

<template>
  <template v-if="route.name === 'about'">
    <router-view :key="$route.path" />
  </template>
  <template v-else>
    <LoadingSpinner v-if="!isReady" class="overlay big animate-fade-in" />
    <div v-else class="flex min-h-screen">
      <div v-if="!domain" id="sidebar" class="flex flex-col">
        <div
          class="sticky top-0 z-40 h-screen max-w-[60px] overflow-hidden bg-skin-bg transition-all sm:w-auto"
          :class="{ 'max-w-0 sm:max-w-none': !showSidebar }"
        >
          <TheSidebar class="border-r border-skin-border" />
        </div>
      </div>
      <div
        class="relative flex w-screen min-w-0 shrink-0 flex-col sm:w-auto sm:shrink sm:grow"
      >
        <div
          class="absolute top-0 right-0 left-0 bottom-0 z-50 bg-skin-bg opacity-60"
          :class="{ hidden: !showSidebar }"
          @click="showSidebar = false"
        />
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
  </template>
  <BaseFlashNotification />
</template>
