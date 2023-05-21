<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';
import { useInfiniteScroll, watchDebounced } from '@vueuse/core';

const props = defineProps<{
  space: ExtendedSpace;
}>();

const {
  fetchDelegates,
  fetchMoreDelegates,
  delegates,
  isLoadingDelegates,
  hasMoreDelegates
} = useDelegates(props.space.delegation);
const { profiles, loadProfiles } = useProfiles();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { domain } = useApp();
const { web3Account } = useWeb3();

const searchInput = ref((route.query.search as string) || '');
const selectedFilter = ref(route.query.filter || 'mostVotingPower');
const showDelegateModal = ref(false);
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

const queryVariables = computed(() => {
  return {
    orderBy: matchFilter.value,
    id: searchInput.value
  };
});

const filterItems = computed(() => {
  return [
    {
      text: t('delegates.filters.mostVotingPower'),
      action: 'mostVotingPower',
      extras: { selected: selectedFilter.value === 'mostVotingPower' }
    },
    {
      text: t('delegates.filters.mostDelegators'),
      action: 'mostDelegators',
      extras: { selected: selectedFilter.value === 'mostDelegators' }
    }
    // {
    //   text: t('delegates.filters.mostProposals'),
    //   action: 'mostProposals',
    //   extras: { selected: selectedFilter.value === 'mostProposals' }
    // },
    // {
    //   text: t('delegates.filters.mostVotes'),
    //   action: 'mostVotes',
    //   extras: { selected: selectedFilter.value === 'mostVotes' }
    // }
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

function handleClickDelegateUser(id: string) {
  selectedDelegate.value = id;
  showDelegateModal.value = true;
}

function handleClickDelegate() {
  selectedDelegate.value = '';
  showDelegateModal.value = true;
}

useInfiniteScroll(
  document,
  () => {
    if (hasMoreDelegates.value) fetchMoreDelegates(queryVariables.value);
  },
  { distance: 250, interval: 500 }
);

watch(delegates, () => {
  loadProfiles(delegates.value.map(delegate => delegate.id));
});

watchDebounced(
  queryVariables,
  () => {
    fetchDelegates(queryVariables.value);
  },
  { debounce: 300 }
);

onMounted(() => {
  fetchDelegates(queryVariables.value);
});
</script>

<template>
  <BaseContainer>
    <div class="mb-3 px-4 md:px-0">
      <ButtonBack
        @click="
          router.push(domain ? { path: '/' } : { name: 'spaceProposals' })
        "
      />
      <h1 v-text="$t('delegates.header')" />
    </div>
    <BaseBlock class="mb-4">
      <div class="flex h-[42px] justify-between">
        <div class="flex gap-2">
          <div
            class="flex w-[330px] rounded-full border pl-3 pr-0 focus-within:border-skin-text"
          >
            <BaseSearch
              :model-value="searchInput"
              :placeholder="$t('searchPlaceholderVotes')"
              class="flex-auto pr-3"
              @update:model-value="handleSearchInput"
            />
          </div>
          <TuneMenu :items="filterItems" @select="handleSelectFilter">
            <template #button>
              <TuneButton class="h-full">
                <div class="leading-2 flex items-center leading-3">
                  <span class="text-skin-link">
                    {{ $t(`delegates.filters.${selectedFilter}`) }}
                  </span>
                  <i-ho-chevron-down class="ml-1 text-xs text-skin-text" />
                </div>
              </TuneButton>
            </template>
          </TuneMenu>
        </div>
        <div class="flex gap-2">
          <TuneButton primary class="px-5" @click="handleClickDelegate">
            Delegate
          </TuneButton>
          <SpaceDelegatesLoggedUser
            v-if="web3Account"
            :space="space"
            :profiles="profiles"
          />
        </div>
      </div>
    </BaseBlock>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
      <SpaceDelegatesSkeleton v-if="isLoadingDelegates" />
      <template v-else>
        <div v-for="(delegate, i) in delegates" :key="i">
          <SpaceDelegatesListItem
            :delegate="delegate"
            :profiles="profiles"
            :space="space"
            @click-delegate="handleClickDelegateUser(delegate.id)"
          />
        </div>
      </template>
    </div>
    <div v-if="hasMoreDelegates" class="mt-4 flex">
      <LoadingSpinner class="mx-auto" big />
    </div>
    <Teleport to="body">
      <SpaceDelegatesDelegateModal
        :open="showDelegateModal"
        :space="space"
        :selected-delegate="selectedDelegate"
        @close="showDelegateModal = false"
        @reload="fetchDelegates(queryVariables)"
      />
    </Teleport>
  </BaseContainer>
</template>
