<script setup>
import { computed, onMounted, provide, watch } from 'vue';
import { useModal } from '@/composables/useModal';
import { useI18n } from '@/composables/useI18n';
import { useDomain } from '@/composables/useDomain';
import { useUserSkin } from '@/composables/useUserSkin';
import { useApp } from '@/composables/useApp';
import { useWeb3 } from '@/composables/useWeb3';
import { useFlashNotification } from '@/composables/useFlashNotification';

const { domain } = useDomain();
const { loadLocale } = useI18n();
const { modalOpen } = useModal();
const { userSkin } = useUserSkin();
const { init, skinName, app } = useApp();
const { web3 } = useWeb3();
const { notify } = useFlashNotification();

provide('web3', web3);
provide('notify', notify);

const skin = computed(() => {
  if (domain && skinName.value !== 'default') {
    let skinClass = skinName.value;
    if (userSkin.value === 'dark-mode')
      skinClass += ` ${skinName.value}-dark-mode`;
    return skinClass;
  }
  return userSkin.value;
});

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
  <UiLoading v-if="app.loading || !app.init" class="overlay big" />
  <div
    v-else
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
      <div class="grow min-w-0 min-h-0 rounded-tl-3xl overflow-x-hidden overflow-y-auto" id="content">
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
