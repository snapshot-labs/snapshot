<script setup>
import { computed, ref, watch } from 'vue';
import { useInfiniteLoader } from '@/composables/useInfiniteLoader';
import { useScrollMonitor } from '@/composables/useScrollMonitor';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { PROPOSALS_QUERY } from '@/helpers/queries';
import { useProfiles } from '@/composables/useProfiles';
import { useUnseenProposals } from '@/composables/useUnseenProposals';
import { lsSet } from '@/helpers/utils';
import { useWeb3 } from '@/composables/useWeb3';
import { useApp } from '@/composables/useApp';
import { useStore } from '@/composables/useStore';

const props = defineProps({ space: Object, spaceId: String });

const { store } = useStore();

const loading = ref(false);

const { loadBy, loadingMore, stopLoadingMore, loadMore } = useInfiniteLoader();
const { apolloQuery } = useApolloQuery();

const spaceMembers = computed(() =>
  props.space.members.length < 1 ? ['none'] : props.space.members
);

const spaceFilterBy = computed(() => store.space.filterBy);

async function loadProposals(skip = 0) {
  const proposalsObj = await apolloQuery(
    {
      query: PROPOSALS_QUERY,
      variables: {
        first: loadBy,
        skip,
        space: props.spaceId,
        state: spaceFilterBy.value === 'core' ? 'all' : spaceFilterBy.value,
        author_in: spaceFilterBy.value === 'core' ? spaceMembers.value : []
      }
    },
    'proposals'
  );
  stopLoadingMore.value = proposalsObj?.length < loadBy;
  store.space.proposals = store.space.proposals.concat(proposalsObj);
}

const { lastSeenProposals, updateLastSeenProposal } = useUnseenProposals();
const { web3Account } = useWeb3();

function emitUpdateLastSeenProposal() {
  if (web3Account.value) {
    lsSet(
      `lastSeenProposals.${web3Account.value.slice(0, 8).toLowerCase()}`,
      Object.assign(lastSeenProposals.value, {
        [props.spaceId]: new Date().getTime()
      })
    );
  }
  updateLastSeenProposal(web3Account.value);
}

async function load() {
  if (store.space.proposals.length > 0) return;
  loading.value = true;
  await loadProposals();
  loading.value = false;
  emitUpdateLastSeenProposal();
}

watch(spaceFilterBy, () => {
  load();
});

watch(
  props.spaceId,
  () => {
    const firstProposal = store.space.proposals[0];
    if (firstProposal && firstProposal?.space.id !== props.spaceId) {
      store.space.proposals = [];
      load();
    }
  },
  { immediate: true }
);

const { endElement } = useScrollMonitor(() =>
  loadMore(() => loadProposals(store.space.proposals.length), loading.value)
);

const { profiles, loadProfiles } = useProfiles();

watch(store.space.proposals, () => {
  loadProfiles(store.space.proposals.map(proposal => proposal.author));
});

const { explore } = useApp();
const proposalsCount = computed(() => {
  const count = explore.value.spaces[props.space.id].proposals;
  return count ? count : 0;
});

const loadingData = computed(() => {
  return loading.value || loadingMore.value;
});
</script>

<template>
  <div>
    <NoResults
      :block="true"
      v-if="!loadingData && proposalsCount && store.space.proposals.length < 1"
    />
    <NoProposals
      v-else-if="!proposalsCount && !loadingData"
      class="mt-2"
      :space="space"
    />
    <div v-else>
      <TimelineProposal
        v-for="(proposal, i) in store.space.proposals"
        :key="i"
        :proposal="proposal"
        :profiles="profiles"
      />
    </div>
    <div
      style="height: 10px; width: 10px; position: absolute"
      ref="endElement"
    />
    <Block v-if="loadingData" :slim="true">
      <RowLoading class="my-2" />
    </Block>
  </div>
</template>
