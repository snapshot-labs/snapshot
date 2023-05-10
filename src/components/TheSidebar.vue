<script setup lang="ts">
import draggable from 'vuedraggable';
import { lsSet, lsGet } from '@/helpers/utils';

const router = useRouter();
const { web3Account } = useWeb3();
const { loadFollows, followingSpaces, loadingFollows } = useFollowSpace();
const { spaceHasUnseenProposals } = useUnseenProposals();
const { domain, showSidebar } = useApp();
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
    class="no-scrollbar flex h-full flex-col items-end overflow-auto overscroll-contain py-2"
    @click="showSidebar = false"
  >
    <div v-if="!domain" class="relative flex items-center px-2">
      <BaseButtonRound class="!border-0" @click="router.push({ name: 'home' })">
        <BaseIcon size="36" name="snapshot" class="text-snapshot" />
      </BaseButtonRound>
    </div>
    <div class="mt-2 px-2">
      <BaseButtonRound
        v-tippy="{
          content: 'Timeline',
          placement: 'right',
          delay: [750, 0],
          touch: ['hold', 500]
        }"
        @click="router.push({ name: 'timeline' })"
      >
        <BaseIcon size="20" name="feed" />
      </BaseButtonRound>
    </div>
    <SidebarSpacesSkeleton
      v-if="spaces.length === 0 && (isLoadingSpaces || loadingFollows)"
    />

    <draggable
      v-else
      v-model="orderedSpaces"
      :component-data="{ type: 'transition-group' }"
      v-bind="{ animation: 200 }"
      item-key="id"
      class="mt-2 space-y-2"
      :delay="200"
      :delay-on-touch-only="true"
      @update="updateSpaceOrder"
    >
      <template #item="{ element }">
        <div
          v-if="spacesMap[element]"
          class="group relative flex items-center px-2"
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
              size="44"
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

    <div class="mt-2 flex flex-col items-center space-y-2 px-2">
      <BaseButtonRound
        v-tippy="{
          content: 'Create space',
          placement: 'right',
          delay: [750, 0],
          touch: ['hold', 500]
        }"
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
