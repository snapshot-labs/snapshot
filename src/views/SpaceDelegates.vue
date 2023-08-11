<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';
import { useInfiniteScroll, refDebounced } from '@vueuse/core';

const props = defineProps<{
  space: ExtendedSpace;
}>();

const {
  fetchDelegate,
  fetchDelegates,
  fetchMoreDelegates,
  fetchDelegateVotesAndProposals,
  delegate,
  delegates,
  isLoadingDelegates,
  isLoadingDelegate,
  hasMoreDelegates,
  delegatesStats
} = useDelegates(props.space.delegationPortal);
const { profiles, loadProfiles } = useProfiles();
const { modalAccountOpen } = useModal();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { isFollowing } = useFollowSpace(props.space.id);
const { web3Account } = useWeb3();
const { loadingStatements, loadStatements, getStatementAbout } = useStatement();

const searchInput = ref((route.query.search as string) || '');
const searchInputDebounced = refDebounced(searchInput, 300);
const selectedFilter = ref(route.query.filter || 'mostVotingPower');
const showModalDelegate = ref(false);
const showModalProfile = ref(false);
const selectedDelegate = ref('');

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
  selectedDelegate.value = id;
  showModalDelegate.value = true;
}

function handleClickProfile(id = '') {
  selectedDelegate.value = id;
  showModalProfile.value = true;
}

useInfiniteScroll(
  document,
  () => {
    if (hasMoreDelegates.value && !searchInput.value)
      fetchMoreDelegates(matchFilter.value);
  },
  { distance: 250, interval: 500 }
);

watch([delegate, delegates], ([newDelegate, newDelegates], [prevDelegate]) => {
  if (searchInput.value && !newDelegate) return;
  const delegateChanged = newDelegate !== prevDelegate;
  if (delegateChanged && newDelegate) {
    loadStatements(props.space.id, [newDelegate.id]);
    loadProfiles([newDelegate.id]);
    fetchDelegateVotesAndProposals([newDelegate.id], props.space.id);
    return;
  }
  if (newDelegates && newDelegates.length > 0) {
    loadStatements(
      props.space.id,
      newDelegates.map(d => d.id)
    );
    loadProfiles(newDelegates.map(d => d.id));
    fetchDelegateVotesAndProposals(
      newDelegates.map(d => d.id),
      props.space.id
    );
  }
});

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
  <div>
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
                class="flex h-[46px] w-full rounded-full border pl-3 pr-0 focus-within:border-skin-text md:w-[250px] lg:w-[280px]"
              >
                <BaseSearch
                  :model-value="searchInput"
                  :placeholder="$t('searchPlaceholderVotes')"
                  class="flex-auto pr-2"
                  @update:model-value="handleSearchInput"
                />
              </div>
              <BaseListbox
                class="mt-2 flex sm:mt-0"
                :model-value="selectedFilter"
                :items="filterItems"
                @update:model-value="handleSelectFilter"
              />
            </div>
            <div class="mt-[10px] flex justify-center gap-[12px] md:mt-0">
              <SpaceDelegatesAccount
                v-if="web3Account"
                class="hidden md:block"
                @click="handleClickProfile(web3Account)"
              />
              <BaseButton
                :primary="isFollowing"
                class="w-full md:w-auto"
                @click="handleClickDelegate()"
              >
                Delegate
              </BaseButton>
            </div>
          </div>
        </div>
        <template v-if="searchInputDebounced">
          <div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <SpaceDelegatesSkeleton v-if="isLoadingDelegate" />
            <SpaceDelegatesListItem
              v-else-if="delegate"
              :delegate="delegate"
              :profiles="profiles"
              :space="space"
              :about="getStatementAbout(delegate.id)"
              :stats="delegatesStats[delegate.id]"
              :loading="loadingStatements"
              @click-delegate="handleClickDelegate(delegate.id)"
              @click-user="handleClickProfile(delegate.id)"
            />
          </div>
          <BaseNoResults v-if="!delegate" use-block />
        </template>
        <template v-else>
          <div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <SpaceDelegatesSkeleton v-if="isLoadingDelegates" />
            <template v-else>
              <div v-for="(d, i) in delegates" :key="i">
                <SpaceDelegatesListItem
                  :delegate="d"
                  :profiles="profiles"
                  :space="space"
                  :about="getStatementAbout(d.id)"
                  :stats="delegatesStats[d.id]"
                  :loading="loadingStatements"
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
    </TheLayout>
    <Teleport to="body">
      <SpaceDelegatesDelegateModal
        :open="showModalDelegate"
        :space="space"
        :selected-delegate="selectedDelegate"
        @close="showModalDelegate = false"
        @reload="fetchDelegates(matchFilter)"
      />

      <SpaceDelegatesProfileModal
        :open="showModalProfile"
        :space="space"
        :profiles="profiles"
        :address="selectedDelegate"
        @close="showModalProfile = false"
      />
    </Teleport>
  </div>
</template>
