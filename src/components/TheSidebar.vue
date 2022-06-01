<script setup lang="ts">
import { watch, onMounted, ref, watchEffect, computed } from 'vue';
import { useRouter } from 'vue-router';
import draggable from 'vuedraggable';
import { useFollowSpace } from '@/composables/useFollowSpace';
import { useWeb3 } from '@/composables/useWeb3';
import { useUnseenProposals } from '@/composables/useUnseenProposals';
import { useApp } from '@/composables/useApp';
import { lsSet, lsGet } from '@/helpers/utils';
import { useExtendedSpaces } from '@/composables/useExtendedSpaces';
import { useSpaces } from '@/composables/useSpaces';

const router = useRouter();

const { web3Account } = useWeb3();
const { loadFollows, followingSpaces } = useFollowSpace();
const { proposals, getProposals, lastSeenProposals, updateLastSeenProposal } =
  useUnseenProposals();
const { domain } = useApp();
const { loadExtentedSpaces, extentedSpaces } = useExtendedSpaces();
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
const hasUnseenProposalsBySpace = space => {
  return proposals.value.some(p => {
    return (
      p.space.id === space && p.created > (lastSeenProposals.value[space] || 0)
    );
  });
};

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

watch(followingSpaces, () => {
  loadExtentedSpaces(followingSpaces.value);
});

watchEffect(() => getProposals(followingSpaces.value));

watch(web3Account, () => {
  loadFollows();
  updateLastSeenProposal(web3Account.value);
});

onMounted(() => {
  loadFollows();
});
</script>

<template>
  <div
    class="flex flex-col h-full overflow-auto no-scrollbar overscroll-contain py-2 items-end"
  >
    <div v-if="!domain" class="flex items-center relative px-2">
      <router-link :to="{ name: 'home' }">
        <UiSidebarButton class="!border-0">
          <BaseIcon size="36" name="snapshot" class="text-snapshot" />
        </UiSidebarButton>
      </router-link>
    </div>
    <div
      class="flex items-center relative px-2 group mt-2"
      v-tippy="{
        content: 'Timeline',
        placement: 'right',
        delay: [750, 0],
        touch: ['hold', 500]
      }"
    >
      <router-link :to="{ name: 'timeline' }">
        <UiSidebarButton
          :class="{ '!border-skin-link': $route.name === 'timeline' }"
        >
          <BaseIcon size="20" name="feed" />
        </UiSidebarButton>
      </router-link>
    </div>
    <Transition name="fade">
      <draggable
        v-if="draggableSpaces.length > 0"
        v-model="draggableSpaces"
        :component-data="{ type: 'transition-group' }"
        v-bind="{ animation: 200 }"
        item-key="id"
        @update="saveSpaceOrder"
        class="space-y-2 mt-2"
        :delay="200"
        :delay-on-touch-only="true"
      >
        <template #item="{ element }">
          <div
            v-if="extentedSpacesObj[element]"
            class="flex items-center relative px-2 group"
            v-tippy="{
              content: extentedSpacesObj[element].name,
              placement: 'right',
              delay: [750, 0],
              touch: ['hold', 500]
            }"
          >
            <SidebarUnreadIndicator
              :space="element"
              :hasUnseen="hasUnseenProposalsBySpace(element)"
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
                :space="extentedSpacesObj[element]"
                :key="element"
                symbolIndex="space"
                :size="44"
                class="pointer-events-none"
              />
              <BaseCounter
                v-if="spaces?.[element]?.activeProposals"
                :counter="spaces[element].activeProposals"
                class="absolute -top-[1px] right-[9px] !bg-green !h-[16px] !leading-[16px] !min-w-[16px]"
              />
            </div>
          </div>
        </template>
      </draggable>
    </Transition>
    <div
      class="flex flex-col items-center px-2 space-y-2 mt-2"
      v-tippy="{
        content: 'Create space',
        placement: 'right',
        delay: [750, 0],
        touch: ['hold', 500]
      }"
    >
      <router-link :to="{ name: 'setup' }">
        <UiSidebarButton
          :class="{ '!border-skin-link': $route.name === 'setup' }"
        >
          <BaseIcon size="20" name="plus" />
        </UiSidebarButton>
      </router-link>
    </div>
  </div>
</template>
