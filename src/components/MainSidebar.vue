<script setup>
import { computed, watch, onMounted, ref } from 'vue';
import { useFollowSpace } from '@/composables/useFollowSpace';
import { useWeb3 } from '@/composables/useWeb3';
import { useApp } from '@/composables/useApp';

const { spaces } = useApp();
const { web3 } = useWeb3();
const { loadFollows, followingSpaces } = useFollowSpace();

const modalAboutOpen = ref(false);
const modalLangOpen = ref(false);

const web3Account = computed(() => web3.value.account);

watch(web3Account, () => loadFollows());

onMounted(() => {
  loadFollows();
});
</script>

<template>
  <div class="w-[68px] h-screen fixed m-0 border-r border-skin-border">
    <div class="flex flex-col h-full overflow-scroll menu-tabs">
      <div
        class="mt-[22px] mb-[20px] flex flex-col items-center justify-center"
      >
        <Icon
          @click="$router.push({ name: 'home' })"
          size="36"
          name="snapshot"
          class="text-snapshot cursor-pointer"
        />
      </div>
      <div class="flex flex-col h-full items-center space-y-3 pt-2">
        <router-link :to="{ name: 'timeline' }">
          <UiSidebarButton>
            <Icon size="20" name="feed" />
          </UiSidebarButton>
        </router-link>
        <div v-for="follow in followingSpaces" :key="follow">
          <a
            @click="
              $router.push({ name: 'proposals', params: { key: follow } })
            "
          >
            <Token :space="spaces[follow]" symbolIndex="space" size="40" />
          </a>
        </div>
        <router-link :to="{ name: 'setup' }">
          <UiSidebarButton><Icon size="20" name="plus" /></UiSidebarButton>
        </router-link>
      </div>
      <div class="flex items-center justify-center mb-3 mt-[12px]">
        <UiSidebarButton
          @click="modalAboutOpen = true"
          class="hover:link-color"
        >
          <span class="select-none mt-1 link-color">?</span>
        </UiSidebarButton>
      </div>
    </div>
  </div>
  <teleport to="#modal">
    <ModalAbout
      :open="modalAboutOpen"
      @close="modalAboutOpen = false"
      @openLang="modalLangOpen = true" />
    <ModalSelectLanguage :open="modalLangOpen" @close="modalLangOpen = false"
  /></teleport>
</template>
