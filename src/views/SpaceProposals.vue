<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { PROPOSALS_QUERY } from '@/helpers/queries';
import { ExtendedSpace } from '@/helpers/interfaces';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { useRoute } from 'vue-router';

import {
  useProposals,
  useInfiniteLoader,
  useUnseenProposals,
  useScrollMonitor,
  useApolloQuery,
  useProfiles,
  useWeb3,
  useMeta
} from '@/composables';

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

const { store, userVotedProposalIds, addSpaceProposals, setSpaceProposals } =
  useProposals();

const loading = ref(false);

const { loadBy, loadingMore, stopLoadingMore, loadMore } = useInfiniteLoader();
const { apolloQuery } = useApolloQuery();

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

const route = useRoute();
const stateFilter = computed(() => route.query.state || 'all');

async function getProposals(skip = 0) {
  return apolloQuery(
    {
      query: PROPOSALS_QUERY,
      variables: {
        first: loadBy,
        skip,
        space_in: [props.space.id, ...subSpaces.value],
        state: stateFilter.value === 'core' ? 'all' : stateFilter.value,
        author_in: stateFilter.value === 'core' ? spaceMembers.value : []
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

const { endElement } = useScrollMonitor(() =>
  loadMore(() => loadMoreProposals(spaceProposals.value.length))
);

const { web3Account } = useWeb3();
const { emitUpdateLastSeenProposal } = useUnseenProposals();
watch(web3Account, () => emitUpdateLastSeenProposal(props.space.id));

async function loadProposals() {
  loading.value = true;
  const proposals = await getProposals();
  emitUpdateLastSeenProposal(props.space.id);
  stopLoadingMore.value = proposals?.length < loadBy;
  loading.value = false;
  setSpaceProposals(proposals);
}

const { profiles, loadProfiles } = useProfiles();
watch(spaceProposals, () => {
  loadProfiles(spaceProposals.value.map((proposal: any) => proposal.author));
});

watch(stateFilter, loadProposals);

watch(
  () => props.space.id,
  () => {
    loadProposals();
  },
  { immediate: true }
);
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
        <div class="flex-auto">
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
      <div v-else class="my-4 space-y-4">
        <BaseBlock
          v-for="(proposal, i) in spaceProposals"
          :key="i"
          slim
          class="transition-colors md:hover:border-skin-text"
        >
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
      </div>
      <div class="relative">
        <div ref="endElement" class="absolute h-[10px] w-[10px]" />
      </div>
      <LoadingRow v-if="loadingMore && !loading" block />
    </template>
  </TheLayout>
</template>
