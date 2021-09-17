<script setup>
import { computed, watch, onMounted, ref, watchEffect } from 'vue';
import { useFollowSpace } from '@/composables/useFollowSpace';
import { useWeb3 } from '@/composables/useWeb3';
import { useApp } from '@/composables/useApp';
import { useDomain } from '@/composables/useDomain';
import { useUnseenProposals } from '@/composables/useUnseenProposals';

const { spaces } = useApp();
const { web3 } = useWeb3();
const { loadFollows, followingSpaces } = useFollowSpace();
const { domain } = useDomain();
const {
  proposalIds,
  getProposalIds,
  lastSeenProposals,
  updateLastSeenProposal
} = useUnseenProposals();

const modalAboutOpen = ref(false);
const modalLangOpen = ref(false);

const web3Account = computed(() => web3.value.account);

watch(web3Account, () => {
  loadFollows();
  updateLastSeenProposal(web3Account.value);
});

watchEffect(() => getProposalIds(followingSpaces.value));

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
        <router-link :to="{ name: 'home' }">
          <Icon
            size="36"
            name="snapshot"
            class="text-snapshot cursor-pointer"
          />
        </router-link>
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
        <div
          class="w-full flex items-center justify-center relative group"
          v-for="space in followingSpaces"
          :key="space"
        >
          <div
            v-if="
              lastSeenProposals[space]
                ? proposalIds
                    .filter(p => p.space.id === space)
                    .map(p => p.created)[0] > lastSeenProposals[space]
                : true
            "
            class="
              w-[8px]
              h-[8px]
              !bg-skin-link
              absolute
              left-[-4px]
              rounded-full
              opacity-70
              group-hover:opacity-100
            "
          />
          <router-link :to="{ name: 'proposals', params: { key: space } }">
            <Token :space="spaces[space]" symbolIndex="space" size="44" />
          </router-link>
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
