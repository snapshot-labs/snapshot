<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';
import { useInfiniteScroll, refDebounced, useBreakpoints } from '@vueuse/core';
import { SNAPSHOT_BREAKPOINTS } from '@/helpers/constants';

const props = defineProps<{
  space: ExtendedSpace;
}>();

const {
  fetchDelegate,
  fetchDelegates,
  fetchMoreDelegates,
  delegate,
  delegates,
  isLoadingDelegates,
  isLoadingDelegate,
  hasMoreDelegates,
  delegatesStats,
  hasDelegatesLoadFailed
} = useDelegates(props.space);
const { profiles } = useProfiles();
const { modalAccountOpen } = useModal();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { isFollowing } = useFollowSpace(props.space.id);
const { web3Account } = useWeb3();
const { getStatementAbout } = useStatement();
const largerThanSm = useBreakpoints(SNAPSHOT_BREAKPOINTS).greater('md');

const searchInput = ref((route.query.search as string) || '');
const searchInputDebounced = refDebounced(searchInput, 300);
const selectedFilter = ref(route.query.filter || 'mostVotingPower');

const matchFilter = computed(() => {
  switch (selectedFilter.value) {
    case 'mostDelegators':
      return 'tokenHoldersRepresentedAmount';
    case 'mostProposals':
      return 'proposalsCount';
    case 'mostVotes':
      return 'votesCount';
    default:
      return 'delegatedVotes';
  }
});

const filterItems = computed(() => {
  return [
    {
      value: 'mostVotingPower',
      title: t('delegates.filters.mostVotingPower')
    },
    {
      value: 'mostDelegators',
      title: t('delegates.filters.mostDelegators')
    }
  ];
});

function handleSearchInput(value: string) {
  searchInput.value = value;
  router.push({
    query: {
      ...route.query,
      search: value || undefined
    }
  });
}

function handleSelectFilter(e: string) {
  selectedFilter.value = e;
  router.push({
    query: {
      ...route.query,
      filter: e
    }
  });
}

function handleClickDelegate(id = '') {
  if (!web3Account.value) {
    modalAccountOpen.value = true;
    return;
  }

  router.push({
    query: {
      ...route.query,
      delegate: id
    }
  });
}

function handleCloseModalDelegate() {
  router.push({
    query: {
      ...route.query,
      delegate: undefined
    }
  });
}

function handleClickProfile(id: string) {
  router.push({
    name: 'spaceDelegate',
    params: {
      address: id.toLowerCase()
    }
  });
}

useInfiniteScroll(
  document,
  () => {
    if (hasMoreDelegates.value && !searchInput.value)
      fetchMoreDelegates(matchFilter.value);
  },
  { distance: 500 }
);

watch(searchInputDebounced, () => {
  fetchDelegate(searchInput.value);
});

watch(matchFilter, () => {
  fetchDelegates(matchFilter.value);
});

onMounted(() => {
  if (searchInput.value) fetchDelegate(searchInput.value);
  fetchDelegates(matchFilter.value);
});
</script>

<template>
  <TheLayout>
    <template #sidebar-left>
      <SpaceSidebar :space="space" />
    </template>
    <template #content-right>
      <h1 class="hidden lg:mb-3 lg:block">
        {{ $t('delegates.header') }}
      </h1>

      <div class="mb-4">
        <div class="justify-between px-[20px] md:flex md:px-0">
          <div class="gap-[12px] sm:flex">
            <div
              class="flex w-full rounded-full border pl-3 pr-0 focus-within:border-skin-text md:w-[250px] lg:w-[280px]"
            >
              <BaseSearch
                :model-value="searchInput"
                :placeholder="$t('searchPlaceholderVotes')"
                class="flex-auto pr-2"
                @update:model-value="handleSearchInput"
              />
            </div>
            <BaseListbox
              class="mt-2 sm:mt-0"
              :model-value="selectedFilter"
              :items="filterItems"
              @update:model-value="handleSelectFilter"
            />
          </div>
          <div class="mt-[8px] flex justify-center gap-[12px] md:mt-0">
            <TheActionbar>
              <div
                id="delegates-action-bar"
                class="flex h-full items-center gap-[12px] px-[20px]"
              />
            </TheActionbar>

            <Teleport to="#delegates-action-bar" :disabled="largerThanSm">
              <SpaceDelegatesAccount
                v-if="web3Account"
                @click="handleClickProfile(web3Account)"
              />
              <BaseButton
                :primary="isFollowing"
                class="w-full md:w-auto"
                @click="handleClickDelegate()"
              >
                Delegate
              </BaseButton>
            </Teleport>
          </div>
        </div>
      </div>
      <BaseMessageBlock v-if="hasDelegatesLoadFailed" level="warning-red">
        An error occurred while loading delegates. Please try again later. If
        the problem persists, consider contacting the space admin or our support
        team on
        <BaseLink link="https://discord.snapshot.org">Discord</BaseLink>
      </BaseMessageBlock>
      <template v-else-if="searchInputDebounced">
        <div
          class="grid grid-cols-1 md:gap-3 lg:grid-cols-2"
          :class="{ 'opacity-40': isLoadingDelegate }"
        >
          <SpaceDelegatesSkeleton v-if="isLoadingDelegate" />
          <SpaceDelegatesCard
            v-else-if="delegate"
            :delegate="delegate"
            :profiles="profiles"
            :space="space"
            :about="getStatementAbout(delegate.id)"
            :stats="delegatesStats[delegate.id]"
            class="border-b"
            @click-delegate="handleClickDelegate(delegate.id)"
            @click-user="handleClickProfile(delegate.id)"
          />
        </div>
        <BaseNoResults v-if="!delegate" use-block />
      </template>
      <template v-else>
        <div
          class="grid grid-cols-1 md:gap-3 lg:grid-cols-2"
          :class="{ 'opacity-40': isLoadingDelegates }"
        >
          <SpaceDelegatesSkeleton v-if="isLoadingDelegates" />
          <template v-else>
            <div
              v-for="(d, i) in delegates"
              :key="i"
              class="last:border-b md:last:border-b-0"
            >
              <SpaceDelegatesCard
                :delegate="d"
                :profiles="profiles"
                :space="space"
                :about="getStatementAbout(d.id)"
                :stats="delegatesStats[d.id]"
                @click-delegate="handleClickDelegate(d.id)"
                @click-user="handleClickProfile(d.id)"
              />
            </div>
          </template>
        </div>
        <div v-if="hasMoreDelegates" class="mt-4 flex">
          <LoadingSpinner class="mx-auto" big />
        </div>
        <BaseNoResults
          v-else-if="!delegates.length && !isLoadingDelegates"
          use-block
        />
      </template>
    </template>
    <Teleport to="body">
      <SpaceDelegatesDelegateModal
        :open="route.query.delegate !== undefined"
        :space="space"
        :address="(route.query.delegate as string) || ''"
        @close="handleCloseModalDelegate"
        @reload="fetchDelegates(matchFilter)"
      />
    </Teleport>
  </TheLayout>
</template>
