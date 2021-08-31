<script setup>
import { computed, watch, onMounted } from 'vue';
import { useFollowSpace } from '@/composables/useFollowSpace';
import { useWeb3 } from '@/composables/useWeb3';
import { useApp } from '@/composables/useApp';

const { spaces } = useApp();
const { web3 } = useWeb3();
const { loadFollows, followingSpaces } = useFollowSpace();

const web3Account = computed(() => web3.value.account);

watch(web3Account, () => loadFollows());

onMounted(() => {
  loadFollows();
});
</script>

<template>
  <div class="w-[70px] h-screen fixed m-0 border-r border-bcolor">
    <div class="h-[78px] flex items-center justify-center">
      <router-link to="/">
        <Icon size="36" name="snapshot" class="text-snapshot" />
      </router-link>
    </div>
    <div
      class="
        flex flex-col
        h-[calc(100%-80px)]
        justify-between
        overflow-scroll
        menu-tabs
      "
    >
      <div class="flex flex-col items-center space-y-3 pt-2">
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
      <div
        class="
          flex flex-col
          items-center
          justify-center
          h-[70px]
          mb-2
          mt-[12px]
        "
      >
        <UiSidebarButton class="hover:text-lcolor">
          <span class="select-none mt-1">?</span>
        </UiSidebarButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>
