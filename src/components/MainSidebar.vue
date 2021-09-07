<script setup>
import { computed, watch, onMounted, ref } from 'vue';
import { useFollowSpace } from '@/composables/useFollowSpace';
import { useWeb3 } from '@/composables/useWeb3';
import { useApp } from '@/composables/useApp';
import { useDomain } from '@/composables/useDomain';

const { spaces } = useApp();
const { web3 } = useWeb3();
const { loadFollows, followingSpaces } = useFollowSpace();
const { domain } = useDomain();

const modalAboutOpen = ref(false);
const modalLangOpen = ref(false);

const web3Account = computed(() => web3.value.account);

watch(web3Account, () => loadFollows());

onMounted(() => {
  loadFollows();
});
</script>

<template>
  <div
    v-if="!domain"
    class="
      w-[68px]
      h-screen
      hidden
      sm:block
      fixed
      m-0
      border-r
      bg-skin-block-bg
    "
  >
    <div class="flex flex-col h-full overflow-scroll menu-tabs">
      <div class="min-h-[78px] h-[78px] flex items-center justify-center">
        <Icon
          @click="$router.push({ name: 'home' })"
          size="36"
          name="snapshot"
          class="text-snapshot cursor-pointer"
        />
      </div>
      <div
        class="
          flex flex-col
          h-[calc(100%-78px)]
          items-center
          space-y-[14px]
          pt-2
        "
      >
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
            <Token :space="spaces[follow]" symbolIndex="space" size="44" />
          </a>
        </div>
        <router-link :to="{ name: 'setup' }">
          <UiSidebarButton><Icon size="20" name="plus" /></UiSidebarButton>
        </router-link>
        <div class="flex items-center justify-center !mb-0 !mt-auto py-[14px]">
          <UiSidebarButton @click="modalAboutOpen = true">
            <span class="mt-1 link-color">?</span>
          </UiSidebarButton>
        </div>
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
