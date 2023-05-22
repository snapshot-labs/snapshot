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

const spaceMembers = computed(() =>
  props.space.members.length < 1 ? ['none'] : props.space.members
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
const titleFilter = computed(() => route.query.q || '');

async function getProposals(skip = 0) {
  return apolloQuery(
    {
      query: PROPOSALS_QUERY,
      variables: {
        first: loadBy,
        skip,
        space_in: [props.space.id, ...subSpaces.value],
        state: stateFilter.value === 'core' ? 'all' : stateFilter.value,
        author_in: stateFilter.value === 'core' ? spaceMembers.value : [],
        title_contains: titleFilter.value
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

watch(stateFilter, () => {
  resetSpaceProposals();
  loadProposals();
});

watchDebounced(
  titleFilter,
  () => {
    resetSpaceProposals();
    loadProposals();
  },
  { debounce: 300 }
);

watch(spaceProposals, () => {
  loadProfiles(spaceProposals.value.map((proposal: any) => proposal.author));
});

onMounted(() => loadProposals());
</script>

<template>
  <TheLayout>
    <template #sidebar-left>
      <SpaceSidebar :space="space" />
    </template>
    <template #content-right>
      <BaseBlock v-if="space.about && stateFilter == 'all'" class="mb-3">
        <TextAutolinker :text="space.about" />
      </BaseBlock>
      <div class="relative mb-3 flex px-3 md:px-0">
        <div class="hidden flex-auto md:flex">
          <div class="flex flex-auto items-center">
            <h2>
              {{ $t('proposals.header') }}
            </h2>
          </div>
        </div>
        <SpaceProposalsMenuFilter />

        <SpaceProposalsNotice
          v-if="spaceProposals.length < 1 && !loading"
          :space-id="space.id"
        />
      </div>

      <LoadingRow v-if="loading" block />

      <SpaceProposalsNoProposals
        v-else-if="spaceProposals.length < 1"
        class="mt-2"
        :space="space"
      />
      <div v-else class="mb-4 space-y-4">
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
