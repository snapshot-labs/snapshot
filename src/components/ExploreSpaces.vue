<script setup>
import { shorten } from '@/helpers/utils';
import { useInfiniteScroll } from '@vueuse/core';

const {
  loadSpacesHome,
  loadMoreSpaceHome,
  isLoadingSpacesHome,
  isLoadingMoreSpacesHome,
  spacesHome,
  spacesHomeTotal
} = useSpaces();
const { formatCompactNumber } = useIntl();
const route = useRoute();

const enableInfiniteScroll = ref(false);

const routeQuery = computed(() => route.query || null);

const queryVariables = computed(() => ({
  category: routeQuery.value?.category,
  network: routeQuery.value?.network,
  search: routeQuery.value?.q
}));

function handleClickMore() {
  loadMoreSpaceHome(queryVariables.value, spacesHome.value.length);
  enableInfiniteScroll.value = true;
}

useInfiniteScroll(
  document,
  () => {
    if (enableInfiniteScroll.value) {
      loadMoreSpaceHome(queryVariables.value, spacesHome.value.length);
    }
  },
  { distance: 250, interval: 500 }
);

watch(
  routeQuery,
  () => {
    loadSpacesHome(queryVariables.value);
  },
  { immediate: true }
);

onMounted(() => {
  loadSpacesHome();
});
</script>

<template>
  <div class="relative">
    <BaseContainer
      class="mb-4 flex flex-col flex-wrap items-center xs:flex-row md:flex-nowrap"
    >
      <div tabindex="-1" class="w-full md:max-w-[420px]">
        <TheSearchBar />
      </div>

      <ExploreMenuCategories />

      <div
        class="mt-2 whitespace-nowrap text-right text-skin-text xs:ml-auto xs:mt-0"
      >
        {{ $tc('spaceCount', [formatCompactNumber(spacesHomeTotal)]) }}
      </div>
    </BaseContainer>

    <BaseContainer slim>
      <ExploreSkeletonLoading v-if="isLoadingSpacesHome" is-spaces />
      <BaseNoResults v-else-if="spacesHome.length < 1" use-block />

      <TransitionGroup
        v-else-if="!isLoadingSpacesHome"
        name="fade"
        tag="div"
        class="grid gap-4 md:grid-cols-3 lg:grid-cols-4"
      >
        <div v-for="space in spacesHome" :key="space.id">
          <router-link
            :to="{ name: 'spaceProposals', params: { key: space.id } }"
          >
            <BaseBlock
              class="mb-0 flex items-center justify-center text-center transition-all hover:border-skin-text"
              style="height: 266px"
            >
              <div class="relative mb-2 inline-block">
                <AvatarSpace
                  :space="space"
                  symbol-index="space"
                  size="82"
                  class="mb-1"
                />
              </div>
              <div class="flex items-center justify-center gap-1 truncate">
                <h3
                  class="mb-0 mt-0 !h-[32px] overflow-hidden pb-0 text-[22px]"
                  v-text="shorten(space.name, 16)"
                />
                <IconVerifiedSpace :space-id="space.id" class="pt-[1px]" />
              </div>
              <div class="mb-[12px] text-skin-text">
                {{
                  $tc('members', space.followersCount, {
                    count: formatCompactNumber(space.followersCount)
                  })
                }}
              </div>
              <ButtonFollow class="!mb-0" :space="space" />
            </BaseBlock>
          </router-link>
        </div>
      </TransitionGroup>
      <div
        v-if="!enableInfiniteScroll && spacesHomeTotal > spacesHome.length"
        class="px-3 text-center md:px-0"
      >
        <BaseButton class="mt-4 w-full" @click="handleClickMore">
          {{ $t('homeLoadmore') }}
        </BaseButton>
      </div>
      <div v-else-if="isLoadingMoreSpacesHome" class="mt-4 flex">
        <LoadingSpinner class="mx-auto" big />
      </div>
    </BaseContainer>
  </div>
</template>
