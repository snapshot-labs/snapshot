<script setup lang="ts">
import { shorten } from '@/helpers/utils';
import { useInfiniteScroll, watchDebounced } from '@vueuse/core';

const route = useRoute();
const { validEnsTlds } = useEns();
const { formatCompactNumber } = useIntl();
const { loadExtendedSpace, extendedSpaces, spaceLoading } = useExtendedSpaces();
const {
  loadSpacesHome,
  loadMoreSpacesHome,
  loadingSpacesHome,
  loadingMoreSpacesHome,
  enableSpaceHomeScroll,
  spacesHome,
  spacesHomeMetrics
} = useSpaces();

const queryInput = ref({
  search: (route.query.q as string) || '',
  category: route.query.category || undefined
});

const isSearchInputTld = computed(() => {
  if (!queryInput.value.search) return false;
  return validEnsTlds.includes(queryInput.value.search.split('.').pop() ?? '');
});

const spaces = computed(() => {
  if (isSearchInputTld.value) {
    const space = extendedSpaces.value.find(
      s => s.id === queryInput.value.search
    );
    return space ? [space] : [];
  }
  return spacesHome.value;
});

function handleClickMore() {
  loadMoreSpacesHome(queryInput.value);
  enableSpaceHomeScroll.value = true;
}

function loadSpaces() {
  if (isSearchInputTld.value) return loadExtendedSpace(queryInput.value.search);
  loadSpacesHome(queryInput.value);
}

useInfiniteScroll(
  document,
  () => {
    if (enableSpaceHomeScroll.value) {
      loadMoreSpacesHome(queryInput.value);
    }
  },
  { distance: 500 }
);

watchDebounced(
  queryInput,
  () => {
    loadSpaces();
  },
  { deep: true, debounce: 300 }
);

onMounted(() => {
  loadSpaces();
});
</script>

<template>
  <div class="relative">
    <BaseContainer
      class="mb-4 flex flex-col flex-wrap items-center xs:flex-row md:flex-nowrap"
    >
      <div tabindex="-1" class="w-full md:max-w-[420px]">
        <TheSearchBar @update:input-search="queryInput.search = $event" />
      </div>

      <ExploreMenuCategories
        :metrics="spacesHomeMetrics.categories"
        @update:category="queryInput.category = $event"
      />

      <div
        v-if="spacesHomeMetrics.total"
        class="mt-2 whitespace-nowrap text-right text-skin-text xs:ml-auto xs:mt-0"
      >
        {{ $tc('spaceCount', [formatCompactNumber(spacesHomeMetrics.total)]) }}
      </div>
    </BaseContainer>

    <BaseContainer slim>
      <ExploreSkeletonLoading
        v-if="loadingSpacesHome || spaceLoading"
        is-spaces
      />
      <BaseNoResults v-else-if="spaces.length < 1" use-block />

      <TransitionGroup
        v-else-if="!loadingSpacesHome && !spaceLoading"
        name="fade"
        tag="div"
        class="grid gap-4 md:grid-cols-3 lg:grid-cols-4"
      >
        <div v-for="space in spaces" :key="space.id">
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
                <IconVerifiedSpace v-if="space.verified" class="pt-[1px]" />
              </div>
              <div class="mb-[12px] text-skin-text">
                {{
                  $tc('members', space.followersCount, {
                    count: formatCompactNumber(space.followersCount)
                  })
                }}
              </div>
              <ButtonFollow :space="space" class="mx-auto" />
            </BaseBlock>
          </router-link>
        </div>
      </TransitionGroup>
      <div
        v-if="
          !enableSpaceHomeScroll &&
          spacesHomeMetrics.total > spacesHome.length &&
          spaces.length >= 12
        "
        class="px-3 text-center md:px-0"
      >
        <BaseButton class="mt-4 w-full" @click="handleClickMore">
          {{ $t('homeLoadmore') }}
        </BaseButton>
      </div>
      <div v-else-if="loadingMoreSpacesHome" class="mt-4 flex h-[46px]">
        <LoadingSpinner class="mx-auto" big />
      </div>
    </BaseContainer>
  </div>
</template>
