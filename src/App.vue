<script setup>
import { onMounted, provide } from 'vue';
import { useSkin } from '@/composables/useSkin';
import { useApp } from '@/composables/useApp';
import { useWeb3 } from '@/composables/useWeb3';
import { useFlashNotification } from '@/composables/useFlashNotification';
import { useDomain } from '@/composables/useDomain';

const { domain } = useDomain();
const { skinClass } = useSkin();
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
    :class="skinClass"
    class="flex font-sans text-base antialiased bg-skin-bg"
  >
    <div v-if="!domain" id="sidebar" class="flex flex-col">
      <div class="h-screen sticky top-0 border-r border-skin-border bg-skin-block-bg z-40">
        <TheSidebar />
      </div>
    </div>
    <div class="grow">
      <div id="navbar" class="sticky top-0 border-b border-skin-border bg-skin-block-bg z-40">
        <TheNavbar />
      </div>
      <div id="content" class="py-4">
        <router-view :key="$route.path" />
      </div>
    </div>
  </div>
  <FlashNotification />
</template>
