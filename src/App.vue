<script setup>
import { onMounted, provide } from 'vue';
import { useSkin } from '@/composables/useSkin';
import { useApp } from '@/composables/useApp';
import { useWeb3 } from '@/composables/useWeb3';
import { useFlashNotification } from '@/composables/useFlashNotification';
import { useDomain } from './composables/useDomain';

const { skin } = useSkin();
const { init, app } = useApp();
const { web3 } = useWeb3();
const { notify } = useFlashNotification();
const { domain } = useDomain();

provide('web3', web3);
provide('notify', notify);

onMounted(async () => {
  init();
});
</script>

<template>
  <div
    v-if="!app.loading"
    :class="skin"
    class="flex h-screen font-sans text-base bg-skin-block-bg text-skin-text antialiased"
  >
    <div v-if="!domain">
      <TheSidebar />
    </div>
    <div class="grow min-w-0 overflow-hidden flex flex-col">
      <div>
        <TheNavbar />
      </div>
      <div
        class="grow min-w-0 min-h-0 rounded-tl-3xl overflow-x-hidden overflow-y-auto"
        id="content"
      >
        <div class="min-h-full flex flex-col bg-skin-bg">
          <main class="grow py-4 relative">
            <router-view :key="$route.path" />
          </main>
          <footer v-if="!domain" class="mt-auto">
            <TheFooter />
          </footer>
        </div>
      </div>
    </div>
  </div>
  <FlashNotification />
</template>
