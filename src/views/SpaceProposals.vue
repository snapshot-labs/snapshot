<script setup>
import { watchEffect, computed, ref, watch } from 'vue';
import { useStore } from '@/composables/useStore';
import { setPageTitle } from '@/helpers/utils';
import { useInfiniteLoader } from '@/composables/useInfiniteLoader';
import { useScrollMonitor } from '@/composables/useScrollMonitor';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { PROPOSALS_QUERY } from '@/helpers/queries';
import { useProfiles } from '@/composables/useProfiles';
import { useUnseenProposals } from '@/composables/useUnseenProposals';
import { lsSet } from '@/helpers/utils';
import { useWeb3 } from '@/composables/useWeb3';
import { useApp } from '@/composables/useApp';

const props = defineProps({ space: Object, spaceId: String });

const { store } = useStore();

const loading = ref(false);

const { loadBy, loadingMore, stopLoadingMore, loadMore } = useInfiniteLoader();
const { apolloQuery } = useApolloQuery();

const spaceMembers = computed(() =>
  props.space?.members
    ? props.space.members.length < 1
      ? ['none']
      : props.space.members
    : null
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

// TODO: Use space query instead of explore, to get total number of proposals
const { explore } = useApp();
const proposalsCount = computed(() => {
  const count = explore.value.spaces[props.spaceId].proposals;
  return count ? count : 0;
});

const loadingData = computed(() => {
  return loading.value || loadingMore.value;
});

function selectState(e) {
  store.space.filterBy = e;
  store.space.proposals = [];
  load();
}

watchEffect(() => {
  if (props.space?.name)
    setPageTitle('page.title.space.proposals', { space: props.space.name });
});
</script>

<template>
  <Layout>
    <template #sidebar-left>
      <SpaceSidebar :space="space" :spaceId="spaceId" />
    </template>
    <template #content-right>
      <div class="px-4 md:px-0 mb-3 flex">
        <div class="flex-auto">
          <div class="flex items-center flex-auto">
            <h2>{{ $t('proposals.header') }}</h2>
          </div>
        </div>
        <UiDropdown
          top="3.5rem"
          right="1.25rem"
          @select="selectState"
          :items="[
            { text: $t('proposals.states.all'), action: 'all' },
            { text: $t('proposals.states.active'), action: 'active' },
            { text: $t('proposals.states.pending'), action: 'pending' },
            { text: $t('proposals.states.closed'), action: 'closed' },
            { text: $t('proposals.states.core'), action: 'core' }
          ]"
        >
          <UiButton class="pr-3">
            {{ $t(`proposals.states.${store.space.filterBy}`) }}
            <Icon size="14" name="arrow-down" class="mt-1 mr-1" />
          </UiButton>
        </UiDropdown>
      </div>
      <NoResults
        :block="true"
        v-if="
          !loadingData && proposalsCount && store.space.proposals.length < 1
        "
      />
      <NoProposals
        v-else-if="space && !proposalsCount && !loadingData"
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
    </template>
  </Layout>
</template>
