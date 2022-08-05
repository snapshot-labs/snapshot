<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue';
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
  useI18n,
  useWeb3
} from '@/composables';

const props = defineProps<{
  space: ExtendedSpace;
}>();

const { store, userVotedProposalIds, addSpaceProposals, setSpaceProposals } =
  useProposals();
const { setPageTitle } = useI18n();

const loading = ref(false);

const { loadBy, loadingMore, stopLoadingMore, loadMore } = useInfiniteLoader();
const { apolloQuery } = useApolloQuery();

const spaceMembers = computed(() =>
  props.space.members.length < 1 ? ['none'] : props.space.members
);

const spaceProposals = computed(() => {
  return clone(store.space.proposals).filter(
    proposal => proposal.space.id === props.space.id
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
        space: props.space.id,
        state: stateFilter.value === 'core' ? 'all' : stateFilter.value,
        author_in: stateFilter.value === 'core' ? spaceMembers.value : []
      }
    },
    'proposals'
  );
}

async function loadMoreProposals(skip = 0) {
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
  loading.value = false;
  setSpaceProposals(proposals);
}

const { profiles, loadProfiles } = useProfiles();
watch(spaceProposals, () => {
  loadProfiles(spaceProposals.value.map((proposal: any) => proposal.author));
});

watch(stateFilter, loadProposals);

onMounted(() => {
  setPageTitle('page.title.space.proposals', { space: props.space.name });
  loadProposals();
});
</script>

<template>
  <TheLayout>
    <template #sidebar-left>
      <SpaceSidebar :space="space" />
    </template>
    <template #content-right>
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

      <BaseBlock v-if="space.about && stateFilter == 'all'" class="mb-3">
        <TextAutolinker :text="space.about" />
      </BaseBlock>

      <LoadingRow v-if="loading" block />

      <SpaceProposalsNoProposals
        v-else-if="spaceProposals.length < 1"
        class="mt-2"
        :space="space"
      />
      <div v-else class="my-4 md:space-y-4">
        <BaseProposalItem
          v-for="(proposal, i) in spaceProposals"
          :key="i"
          :proposal="proposal"
          :profiles="profiles"
          :space="space"
          :voted="userVotedProposalIds.includes(proposal.id)"
          class="border-b first:border-t"
        />
      </div>
      <div class="relative">
        <div ref="endElement" class="absolute h-[10px] w-[10px]" />
      </div>
      <LoadingRow v-if="loadingMore" block />
    </template>
  </TheLayout>
</template>
