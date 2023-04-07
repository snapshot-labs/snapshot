<script setup lang="ts">
import draggable from 'vuedraggable';

import { lsSet, lsGet } from '@/helpers/utils';

const { web3Account } = useWeb3();
const { loadFollows, followingSpaces, loadingFollows } = useFollowSpace();
const { spaceHasUnseenProposals } = useUnseenProposals();
const { domain, showSidebar } = useApp();
const router = useRouter();
const { loadExtendedSpaces, extendedSpaces, spaceLoading } =
  useExtendedSpaces();
const { spaces } = useSpaces();

const draggableSpaces = ref<string[]>([]);

const extendedSpacesObj = computed(() => {
  return (
    extendedSpaces.value?.reduce(
      (acc, space) => ({ ...acc, [space.id]: space }),
      {}
    ) ?? {}
  );
});

function saveSpaceOrder() {
  if (web3Account.value)
    lsSet(
      `sidebarSpaceOrder.${web3Account.value.slice(0, 8).toLowerCase()}`,
      draggableSpaces.value
    );
}

watch(followingSpaces, () => {
  draggableSpaces.value = followingSpaces.value;
  const sidebarSpaceOrder = lsGet(
    `sidebarSpaceOrder.${web3Account.value.slice(0, 8).toLowerCase()}`,
    []
  );
  // Order side bar and add new spaces to the end of the sidebar
  draggableSpaces.value.sort((a, b) => {
    if (!sidebarSpaceOrder.includes(a)) return -1;
    if (!sidebarSpaceOrder.includes(b)) return 1;
    return sidebarSpaceOrder.indexOf(a) - sidebarSpaceOrder.indexOf(b);
  });

  saveSpaceOrder();
});

watch(followingSpaces, () => {
  loadExtendedSpaces(followingSpaces.value);
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
      <RoundButton class="!border-0" @click="router.push({ name: 'home' })">
        <BaseIcon size="36" name="snapshot" class="text-snapshot" />
      </RoundButton>
    </div>
    <div class="mt-2 px-2">
      <RoundButton
        v-tippy="{
          content: 'Timeline',
          placement: 'right',
          delay: [750, 0],
          touch: ['hold', 500]
        }"
        @click="router.push({ name: 'timeline' })"
      >
        <BaseIcon size="20" name="feed" />
      </RoundButton>
    </div>
    <SidebarSpacesSkeleton
      v-if="extendedSpaces.length === 0 && (spaceLoading || loadingFollows)"
    />

    <draggable
      v-else
      v-model="draggableSpaces"
      :component-data="{ type: 'transition-group' }"
      v-bind="{ animation: 200 }"
      item-key="id"
      class="mt-2 space-y-2"
      :delay="200"
      :delay-on-touch-only="true"
      @update="saveSpaceOrder"
    >
      <template #item="{ element }">
        <div
          v-if="extendedSpacesObj[element]"
          class="group relative flex items-center px-2"
        >
          <SidebarUnreadIndicator
            :space="element"
            :has-unseen="spaceHasUnseenProposals(element)"
          />
          <router-link
            v-tippy="{
              content: extendedSpacesObj[element].name,
              placement: 'right',
              delay: [750, 0],
              touch: ['hold', 500]
            }"
            :to="{
              name: 'spaceProposals',
              params: { key: extendedSpacesObj[element].id }
            }"
          >
            <AvatarSpace
              :key="element"
              :space="extendedSpacesObj[element]"
              symbol-index="space"
              size="44"
              class="pointer-events-none"
            />
            <BaseCounter
              v-if="spaces?.[element]?.proposals_active"
              :counter="spaces[element].proposals_active"
              class="absolute -top-[1px] right-[9px] !h-[16px] !min-w-[16px] !bg-green !leading-[16px]"
            />
          </router-link>
        </div>
      </template>
    </draggable>

    <div class="mt-2 flex flex-col items-center space-y-2 px-2">
      <RoundButton
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
      </RoundButton>
    </div>
  </div>
</template>
