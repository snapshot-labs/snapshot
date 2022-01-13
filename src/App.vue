<script setup>
import { computed, onMounted, provide, watch } from 'vue';
import { useModal } from '@/composables/useModal';
import { useI18n } from '@/composables/useI18n';
import { useDomain } from '@/composables/useDomain';
import { useUserSkin } from '@/composables/useUserSkin';
import { useApp } from '@/composables/useApp';
import { useWeb3 } from '@/composables/useWeb3';
import { useNotifications } from '@/composables/useNotifications';

const { domain } = useDomain();
const { loadLocale } = useI18n();
const { modalOpen } = useModal();
const { userSkin } = useUserSkin();
const { init, skinName, app } = useApp();
const { web3 } = useWeb3();
const { notify } = useNotifications();

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
  <div
    v-if="skinName"
    :class="skin"
    class="overflow-hidden pb-6 font-serif text-base min-h-screen bg-skin-bg text-skin-text antialiased"
  >
    <UiLoading v-if="app.loading || !app.init" class="overlay big" />
    <div v-else>
      <Scroller />
      <div :class="{ 'sm:ml-[68px]': !domain }">
        <Topnav />
        <router-view :key="$route.path" class="flex-auto" />
      </div>
    </div>
    <div id="modal" />
    <Notifications />
  </div>
</template>
