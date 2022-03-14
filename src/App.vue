<script setup>
import { onMounted, provide } from 'vue';
import { useSkin } from '@/composables/useSkin';
import { useApp } from '@/composables/useApp';
import { useWeb3 } from '@/composables/useWeb3';
import { useFlashNotification } from '@/composables/useFlashNotification';
import { useDomain } from '@/composables/useDomain';

const { domain } = useDomain();
const { skinClass, userTheme } = useSkin();
const { init, ready } = useApp();
const { web3 } = useWeb3();
const { notify } = useFlashNotification();

provide('web3', web3);
provide('notify', notify);

onMounted(async () => {
  init();
});
</script>

<template>
  <UiLoading v-if="!ready" class="overlay big" />
  <div
    v-else
    :class="[skinClass, userTheme]"
    class="flex h-screen font-sans text-base antialiased bg-skin-block-bg"
  >
    <div v-if="!domain" class="bg-skin-block-bg text-skin-text hidden md:block border-r border-skin-border">
      <TheSidebar />
    </div>
    <div class="grow min-w-0 overflow-hidden flex flex-col">
      <div class="bg-skin-block-bg text-skin-text border-b border-skin-border">
        <TheNavbar />
      </div>
      <div
        class="grow min-w-0 min-h-0 overflow-x-hidden overflow-y-auto"
        style="scrollbar-gutter: stable"
        id="content"
      >
        <div class="min-h-full flex flex-col bg-skin-bg">
          <main class="grow py-4 relative">
            <router-view :key="$route.path" />
          </main>
        </div>
      </div>
    </div>
  </div>
  <FlashNotification />
</template>
