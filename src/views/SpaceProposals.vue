<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue';
import { PROPOSALS_QUERY } from '@/helpers/queries';
import { lsSet } from '@/helpers/utils';
import { useWeb3 } from '@/composables/useWeb3';
import { ExtendedSpace } from '@/helpers/interfaces';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import {
  useProposals,
  useI18n,
  useInfiniteLoader,
  useScrollMonitor,
  useApolloQuery,
  useProfiles,
  useUnseenProposals
} from '@/composables';

const props = defineProps<{
  space: ExtendedSpace;
}>();

const {
  store,
  userVotedProposalIds,
  setSpaceFilter,
  resetSpaceProposals,
  addSpaceProposals
} = useProposals();
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

const spaceFilterBy = computed(() => store.space.filterBy);

async function loadProposals(skip = 0) {
  const proposalsObj = await apolloQuery(
    {
      query: PROPOSALS_QUERY,
      variables: {
        first: loadBy,
        skip,
        space: props.space.id,
        state: spaceFilterBy.value === 'core' ? 'all' : spaceFilterBy.value,
        author_in: spaceFilterBy.value === 'core' ? spaceMembers.value : []
      }
    },
    'proposals'
  );
  stopLoadingMore.value = proposalsObj?.length < loadBy;
  addSpaceProposals(proposalsObj);
}

const { lastSeenProposals, updateLastSeenProposal } = useUnseenProposals();
const { web3Account } = useWeb3();

function emitUpdateLastSeenProposal() {
  if (web3Account.value) {
    lsSet(
      `lastSeenProposals.${web3Account.value.slice(0, 8).toLowerCase()}`,
      Object.assign(lastSeenProposals.value, {
        [props.space.id]: new Date().getTime()
      })
    );
  }
  updateLastSeenProposal(web3Account.value);
}

watch(web3Account, () => emitUpdateLastSeenProposal());

async function load() {
  if (spaceProposals.value.length > 0) return;
  loading.value = true;
  await loadProposals();
  loading.value = false;
  emitUpdateLastSeenProposal();
}

const { endElement } = useScrollMonitor(() =>
  loadMore(() => loadProposals(spaceProposals.value.length), loadingMore.value)
);

const { profiles, loadProfiles } = useProfiles();

watch(spaceProposals, () => {
  loadProfiles(spaceProposals.value.map((proposal: any) => proposal.author));
});

const loadingData = computed(() => {
  return loading.value || loadingMore.value;
});

function selectState(e) {
  setSpaceFilter(e);
  load();
}

onMounted(() => {
  setPageTitle('page.title.space.proposals', { space: props.space.name });

  const firstProposal: any = spaceProposals.value[0];
  if (firstProposal && firstProposal?.space.id !== props.space.id) {
    resetSpaceProposals();
    load();
  }
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
            <h2>{{ $t('proposals.header') }}</h2>
          </div>
        </div>
        <BaseMenu
          :items="[
            {
              text: $t('proposals.states.all'),
              action: 'all',
              extras: { selected: spaceFilterBy === 'all' }
            },
            {
              text: $t('proposals.states.active'),
              action: 'active',
              extras: { selected: spaceFilterBy === 'active' }
            },
            {
              text: $t('proposals.states.pending'),
              action: 'pending',
              extras: { selected: spaceFilterBy === 'pending' }
            },
            {
              text: $t('proposals.states.closed'),
              action: 'closed',
              extras: { selected: spaceFilterBy === 'closed' }
            },
            {
              text: $t('proposals.states.core'),
              action: 'core',
              extras: { selected: spaceFilterBy === 'core' }
            }
          ]"
          :selected="$t(`proposals.states.${store.space.filterBy}`)"
          @select="selectState"
        />

        <SpaceProposalsNotice
          v-if="spaceProposals.length < 1 && !loadingData"
          :space-id="space.id"
          :web3-account="web3Account"
        />
      </div>

      <BaseBlock v-if="space.about && spaceFilterBy == 'all'" class="mb-3">
        <TextAutolinker :text="space.about" />
      </BaseBlock>

      <SpaceProposalsNoProposals
        v-if="!loadingData && spaceProposals.length < 1"
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
      <div ref="endElement" class="absolute bottom-0 h-[10px] w-[10px]" />
      <LoadingRow v-if="loadingData" block />
    </template>
  </TheLayout>
</template>
