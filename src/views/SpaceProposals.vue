<script setup lang="ts">
import { PROPOSALS_QUERY } from '@/helpers/queries';
import { ExtendedSpace } from '@/helpers/interfaces';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { useInfiniteScroll, watchDebounced } from '@vueuse/core';

const props = defineProps<{
  space: ExtendedSpace;
}>();

useMeta({
  title: {
    key: 'metaInfo.space.proposals.title',
    params: {
      space: props.space.name
    }
  },
  description: {
    key: 'metaInfo.space.proposals.description',
    params: {
      about: props.space.about.slice(0, 160)
    }
  }
});

const {
  store,
  userVotedProposalIds,
  addSpaceProposals,
  resetSpaceProposals,
  setSpaceProposals
} = useProposals();

const loading = ref(false);

const route = useRoute();
const { loadBy, loadingMore, stopLoadingMore, loadMore } = useInfiniteLoader();
const { emitUpdateLastSeenProposal } = useUnseenProposals();
const { profiles, loadProfiles } = useProfiles();
const { apolloQuery } = useApolloQuery();
const { web3Account } = useWeb3();
const { isFollowing } = useFollowSpace(props.space.id);

const spaceMembers = computed(() =>
  props.space.members.length < 1
    ? ['none']
    : [...props.space.members, ...props.space.moderators, ...props.space.admins]
);

const subSpaces = computed(
  () => props.space.children?.map(space => space.id) ?? []
);

const spaceProposals = computed(() => {
  return clone(store.space.proposals).filter(proposal =>
    [props.space.id.toLowerCase(), ...subSpaces.value].includes(
      proposal.space.id.toLowerCase()
    )
  );
});

const stateFilter = computed(() => route.query.state || 'all');
const titleSearch = computed(() => route.query.q || '');
const showOnlyCore = computed(() => (route.query.onlyCore as string) || '0');
const showFlagged = computed(() => (route.query.showFlagged as string) || '0');

async function getProposals(skip = 0) {
  return apolloQuery(
    {
      query: PROPOSALS_QUERY,
      variables: {
        first: loadBy,
        skip,
        space_in: [props.space.id, ...subSpaces.value],
        state: stateFilter.value,
        author_in: showOnlyCore.value === '1' ? spaceMembers.value : [],
        title_contains: titleSearch.value,
        flagged: showFlagged.value === '0' ? false : undefined
      }
    },
    'proposals'
  );
}

async function loadMoreProposals(skip: number) {
  if (skip === 0) return;
  const proposals = await getProposals(skip);
  stopLoadingMore.value = proposals?.length < loadBy;
  addSpaceProposals(proposals);
}

useInfiniteScroll(
  document,
  () => {
    if (loadingMore.value) return;
    loadMore(() => loadMoreProposals(spaceProposals.value.length));
  },
  { distance: 400 }
);

watch(web3Account, () => emitUpdateLastSeenProposal(props.space.id));

async function loadProposals() {
  loading.value = true;
  const proposals = await getProposals();
  stopLoadingMore.value = proposals?.length < loadBy;
  emitUpdateLastSeenProposal(props.space.id);
  setSpaceProposals(proposals);
  loading.value = false;
}

watch(
  [stateFilter, showOnlyCore, showFlagged],
  () => {
    resetSpaceProposals();
    loadProposals();
  },
  { immediate: true }
);

watchDebounced(
  titleSearch,
  () => {
    resetSpaceProposals();
    loadProposals();
  },
  { debounce: 300 }
);

watch(spaceProposals, () => {
  loadProfiles(spaceProposals.value.map((proposal: any) => proposal.author));
});
</script>

<template>
  <TheLayout>
    <template #sidebar-left>
      <SpaceSidebar :space="space" />
    </template>
    <template #content-right>
      <div class="relative">
        <SpaceProposalsNotice
          v-if="spaceProposals.length < 1 && !loading"
          :space-id="space.id"
        />
      </div>

      <h1 class="hidden lg:mb-3 lg:block">
        {{ $t('proposals.header') }}
      </h1>

      <div
        class="mb-4 flex flex-col justify-between gap-x-3 gap-y-[10px] px-[20px] sm:flex-row md:px-0"
      >
        <SpaceProposalsSearch />
        <BaseLink
          :link="{ name: 'spaceCreate' }"
          data-testid="create-proposal-button"
        >
          <BaseButton :primary="isFollowing" class="w-full sm:w-auto">
            New proposal
          </BaseButton>
        </BaseLink>
      </div>

      <LoadingRow v-if="loading" block />

      <BaseNoResults v-else-if="spaceProposals.length < 1" />
      <div v-else class="mb-3 space-y-3">
        <template v-for="(proposal, i) in spaceProposals" :key="i">
          <BaseBlock slim class="transition-colors">
            <ProposalsItem
              :proposal="proposal"
              :profiles="profiles"
              :space="space"
              :voted="userVotedProposalIds.includes(proposal.id)"
              :hide-space-avatar="proposal.space.id === space.id"
              :to="{
                name: 'spaceProposal',
                params: { id: proposal.id, key: proposal.space.id }
              }"
            />
          </BaseBlock>
        </template>
      </div>
      <LoadingRow v-if="loadingMore && !loading" block />
    </template>
  </TheLayout>
</template>
