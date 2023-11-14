<script setup lang="ts">
import draggable from 'vuedraggable';
import { lsSet, lsGet } from '@/helpers/utils';

const router = useRouter();
const { web3Account } = useWeb3();
const { loadFollows, followingSpaces, loadingFollows } = useFollowSpace();
const { spaceHasUnseenProposals } = useUnseenProposals();
const { showSidebar } = useApp();
const { loadSpaces, spaces, isLoadingSpaces } = useSpaces();

const orderedSpaces = ref<string[]>([]);

const spacesMap = computed(() => {
  return (
    spaces.value?.reduce((acc, space) => ({ ...acc, [space.id]: space }), {}) ??
    {}
  );
});

function updateSpaceOrder() {
  if (web3Account.value)
    lsSet(
      `savedSpaceOrder.${web3Account.value.slice(0, 8).toLowerCase()}`,
      orderedSpaces.value
    );
}

watch(followingSpaces, () => {
  orderedSpaces.value = followingSpaces.value;
  const savedSpaceOrder = lsGet(
    `savedSpaceOrder.${web3Account.value.slice(0, 8).toLowerCase()}`,
    []
  );
  // Order side bar and add new spaces to the end of the sidebar
  orderedSpaces.value.sort((a, b) => {
    if (!savedSpaceOrder.includes(a)) return -1;
    if (!savedSpaceOrder.includes(b)) return 1;
    return savedSpaceOrder.indexOf(a) - savedSpaceOrder.indexOf(b);
  });

  updateSpaceOrder();
});

watch(followingSpaces, () => {
  loadSpaces(followingSpaces.value);
});

watch(
  web3Account,
  () => {
    loadFollows();
  },
  { immediate: true }
);
</script>

<template>
  <div
    class="no-scrollbar flex h-full flex-col items-end overflow-auto overscroll-contain pb-[12px]"
    @click="showSidebar = false"
  >
    <div class="w-full" @click="router.push({ name: 'home' })">
      <div class="flex h-[70px] items-center justify-center">
        <BaseIcon size="35" name="snapshot" class="text-snapshot" />
      </div>
    </div>
    <div class="mt-[6px] px-[10px]">
      <BaseButtonRound
        v-tippy="{
          content: 'Timeline',
          placement: 'right',
          delay: [750, 0],
          touch: ['hold', 500]
        }"
        size="40px"
        @click="router.push({ name: 'timeline' })"
      >
        <BaseIcon size="20" name="feed" />
      </BaseButtonRound>
    </div>
    <SidebarSpacesSkeleton
      v-if="spaces.length === 0 && (isLoadingSpaces || loadingFollows)"
    />
    <draggable
      v-else-if="spaces.length > 0 && web3Account"
      v-model="orderedSpaces"
      :component-data="{ type: 'transition-group' }"
      v-bind="{ animation: 200 }"
      item-key="id"
      class="mt-[12px] space-y-[12px]"
      :delay="200"
      :delay-on-touch-only="true"
      @update="updateSpaceOrder"
    >
      <template #item="{ element }">
        <div
          v-if="spacesMap[element]"
          class="group relative flex items-center px-[10px]"
        >
          <SidebarUnreadIndicator
            :space="element"
            :has-unseen="spaceHasUnseenProposals(element)"
          />
          <router-link
            v-tippy="{
              content: spacesMap[element].name,
              placement: 'right',
              delay: [750, 0],
              touch: ['hold', 500]
            }"
            :to="{
              name: 'spaceProposals',
              params: { key: spacesMap[element].id }
            }"
          >
            <AvatarSpace
              :key="element"
              :space="spacesMap[element]"
              symbol-index="space"
              size="40"
              class="pointer-events-none"
            />
            <BaseCounter
              v-if="spacesMap[element].activeProposals"
              :counter="spacesMap[element].activeProposals"
              class="absolute -top-[1px] right-[9px] !h-[16px] !min-w-[16px] !bg-green !leading-[16px]"
            />
          </router-link>
        </div>
      </template>
    </draggable>

    <div class="flex w-[60px] items-center justify-center py-[15px]">
      <div class="h-[1px] w-[20px] bg-skin-border" />
    </div>

    <div class="flex flex-col items-center space-y-2 px-[10px]">
      <BaseButtonRound
        v-tippy="{
          content: 'Create space',
          placement: 'right',
          delay: [750, 0],
          touch: ['hold', 500]
        }"
        size="40px"
        @click="
          router.push({
            name: 'setup',
            query: {
              step: '0'
            }
          })
        "
      >
        <i-ho-plus-sm />
      </BaseButtonRound>
    </div>
  </div>
</template>
