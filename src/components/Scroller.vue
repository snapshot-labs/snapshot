<script setup>
import { computed, watch, onMounted, ref, watchEffect } from 'vue';
import draggable from 'vuedraggable';
import { useFollowSpace } from '@/composables/useFollowSpace';
import { useWeb3 } from '@/composables/useWeb3';
import { useApp } from '@/composables/useApp';
import { useDomain } from '@/composables/useDomain';
import { useUnseenProposals } from '@/composables/useUnseenProposals';
import { lsSet, lsGet } from '@/helpers/utils';

const { explore } = useApp();
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
const draggableSpaces = ref([]);

const web3Account = computed(() => web3.value.account);

function saveSpaceOrder() {
  if (web3Account.value)
    lsSet(
      `sidebarSpaceOrder.${web3Account.value.slice(0, 8).toLowerCase()}`,
      draggableSpaces.value
    );
}
const hasUnseenProposalsBySpace = space => {
  return proposalIds.value.some(p => {
    return (
      p.space.id === space && p.created > (lastSeenProposals.value[space] || 0)
    );
  });
};

const hasUnseenProposals = () =>
  followingSpaces.value.some(fs => hasUnseenProposalsBySpace(fs));

watch(web3Account, () => {
  loadFollows();
  updateLastSeenProposal(web3Account.value);
});

watch(followingSpaces, () => {
  draggableSpaces.value = followingSpaces.value;
  const sidebarSpaceOrder = lsGet(
    `sidebarSpaceOrder.${web3Account.value.slice(0, 8).toLowerCase()}`,
    []
  );
  // Order side bar and add new spaces to the end of the sidebar
  draggableSpaces.value.sort((a, b) => {
    if (!draggableSpaces.value.some(() => sidebarSpaceOrder.includes(a)))
      return 1;
    if (!draggableSpaces.value.some(() => sidebarSpaceOrder.includes(b)))
      return -1;
    return sidebarSpaceOrder.indexOf(a) - sidebarSpaceOrder.indexOf(b);
  });

  saveSpaceOrder();
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
        <router-link :to="{ path: '/' }">
          <Icon
            size="36"
            name="snapshot"
            class="text-snapshot cursor-pointer"
          />
        </router-link>
      </div>
      <div
        class="flex flex-col h-[calc(100%-78px)] items-center space-y-2 pt-2"
      >
        <div class="flex items-center justify-center relative w-full">
          <UiUnreadIndicator v-if="hasUnseenProposals()" />
          <router-link :to="{ name: 'timeline' }">
            <UiSidebarButton>
              <Icon size="20" name="feed" />
            </UiSidebarButton>
          </router-link>
        </div>
        <draggable
          v-if="draggableSpaces.length > 0"
          v-model="draggableSpaces"
          :component-data="{ name: 'list' }"
          item-key="id"
          @update="saveSpaceOrder"
          class="w-full space-y-2"
        >
          <template #item="{ element }">
            <div class="w-full flex items-center justify-center relative group">
              <UiUnreadIndicator
                class="group-hover:opacity-100 group-active:hidden"
                v-if="hasUnseenProposalsBySpace(element)"
              />
              <router-link
                :to="{ name: 'spaceProposals', params: { key: element } }"
              >
                <Token
                  :space="explore.spaces[element]"
                  symbolIndex="space"
                  size="44"
                />
              </router-link>
            </div>
          </template>
        </draggable>
        <router-link :to="{ name: 'setup' }">
          <UiSidebarButton><Icon size="20" name="plus" /></UiSidebarButton>
        </router-link>
        <div
          class="
            flex flex-col
            items-center
            space-y-2
            justify-center
            !mb-2
            !mt-auto
            py-2
          "
        >
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
