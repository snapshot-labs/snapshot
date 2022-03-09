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
  <div class="flex h-screen">
    <div class="border-r">
      Sidebar
    </div>
    <div class="grow min-w-0 overflow-x-hidden flex flex-col">
      <div class="border-b">Topnav</div>
      <div class="grow min-w-0 min-h-0 overflow-x-hidden overflow-y-auto">
        <div class="h-full flex flex-col">
          <main class="grow">content</main>
          <footer class="mt-auto border-t">footer</footer>
        </div>
      </div>
    </div>
  </div>
</template>
