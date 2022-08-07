<script setup lang="ts">
import { watch, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import draggable from 'vuedraggable';

import { lsSet, lsGet } from '@/helpers/utils';

import {
  useUnseenProposals,
  useExtendedSpaces,
  useFollowSpace,
  useSpaces,
  useWeb3,
  useApp
} from '@/composables';

const router = useRouter();

const { web3Account } = useWeb3();
const { loadFollows, followingSpaces, loadingFollows } = useFollowSpace();
const { spaceHasUnseenProposals } = useUnseenProposals();
const { domain, showSidebar } = useApp();
const { loadExtentedSpaces, extentedSpaces, spaceLoading } =
  useExtendedSpaces();
const { spaces } = useSpaces();

const draggableSpaces = ref<string[]>([]);

const extentedSpacesObj = computed(() => {
  return (
    extentedSpaces.value?.reduce(
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
  loadExtentedSpaces(followingSpaces.value);
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
      <router-link :to="{ name: 'home' }">
        <ButtonSidebar class="!border-0">
          <BaseIcon size="36" name="snapshot" class="text-snapshot" />
        </ButtonSidebar>
      </router-link>
    </div>
    <div
      v-tippy="{
        content: 'Timeline',
        placement: 'right',
        delay: [750, 0],
        touch: ['hold', 500]
      }"
      class="group relative mt-2 flex items-center px-2"
    >
      <router-link :to="{ name: 'timeline' }">
        <ButtonSidebar
          :class="{ '!border-skin-link': $route.name === 'timeline' }"
        >
          <BaseIcon size="20" name="feed" />
        </ButtonSidebar>
      </router-link>
    </div>
    <SidebarSpacesSkeleton v-if="loadingFollows || spaceLoading" />
    <Transition name="fade">
      <draggable
        v-show="draggableSpaces.length > 0 && !spaceLoading"
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
            v-if="extentedSpacesObj[element]"
            v-tippy="{
              content: extentedSpacesObj[element].name,
              placement: 'right',
              delay: [750, 0],
              touch: ['hold', 500]
            }"
            class="group relative flex items-center px-2"
          >
            <SidebarUnreadIndicator
              :space="element"
              :has-unseen="spaceHasUnseenProposals(element)"
            />
            <div
              class="cursor-pointer"
              @click="
                router.push({
                  name: 'spaceProposals',
                  params: { key: element }
                })
              "
            >
              <AvatarSpace
                :key="element"
                :space="extentedSpacesObj[element]"
                symbol-index="space"
                size="44"
                class="pointer-events-none"
              />
              <BaseCounter
                v-if="spaces?.[element]?.proposals_active"
                :counter="spaces[element].proposals_active"
                class="absolute -top-[1px] right-[9px] !h-[16px] !min-w-[16px] !bg-green !leading-[16px]"
              />
            </div>
          </div>
        </template>
      </draggable>
    </Transition>
    <div
      v-tippy="{
        content: 'Create space',
        placement: 'right',
        delay: [750, 0],
        touch: ['hold', 500]
      }"
      class="mt-2 flex flex-col items-center space-y-2 px-2"
    >
      <router-link
        :to="{
          name: 'setup'
        }"
      >
        <ButtonSidebar
          :class="{ '!border-skin-link': $route.name === 'setup' }"
        >
          <i-ho-plus-sm />
        </ButtonSidebar>
      </router-link>
    </div>
  </div>
</template>
