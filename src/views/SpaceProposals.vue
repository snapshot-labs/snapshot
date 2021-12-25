<script setup>
import { computed, onMounted, ref, watch, watchEffect } from 'vue';
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
import { setPageTitle } from '@/helpers/utils';

const props = defineProps({ space: Object, spaceId: String });

const { lastSeenProposals, updateLastSeenProposal } = useUnseenProposals();
const { web3Account } = useWeb3();
const { store } = useStore();

const loading = ref(false);

const spaceMembers = computed(() =>
  props.space.members.length < 1 ? ['none'] : props.space.members
);

const { loadBy, loadingMore, stopLoadingMore, loadMore } = useInfiniteLoader();

const { apolloQuery } = useApolloQuery();

async function loadProposals(skip = 0) {
  const proposalsObj = await apolloQuery(
    {
      query: PROPOSALS_QUERY,
      variables: {
        first: loadBy,
        skip,
        space: props.spaceId,
        state: store.space.filterBy === 'core' ? 'all' : store.space.filterBy,
        author_in: store.space.filterBy === 'core' ? spaceMembers.value : []
      }
    },
    'proposals'
  );
  stopLoadingMore.value = proposalsObj?.length < loadBy;
  store.space.proposals = store.space.proposals.concat(proposalsObj);
}

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

onMounted(() => {
  setPageTitle('page.title.space.proposals', { space: props.space.name });
});

async function load() {
  if (store.space.proposals.length > 0) return;
  loading.value = true;
  await loadProposals();
  loading.value = false;
  emitUpdateLastSeenProposal();
}

watchEffect(() => {
  if (store.space.proposals[0]?.space.id !== props.spaceId) {
    store.space.proposals = [];
    load();
  }
});

function selectState(e) {
  store.space.filterBy = e;
  store.space.proposals = [];
  load();
}

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
</script>

<template>
  <Layout>
    <template #sidebar-left>
      <BlockSpace :space="space" />
    </template>
    <template #content-right>
      <div class="px-4 md:px-0 mb-3 flex">
        <div class="flex-auto">
          <div v-text="space.name" />
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

      <Block v-if="loading" :slim="true">
        <RowLoading class="my-2" />
      </Block>
      <NoResults
        :block="true"
        v-else-if="proposalsCount && store.space.proposals.length < 1"
      />
      <NoProposals v-else-if="!proposalsCount" class="mt-2" :space="space" />
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
      <Block v-if="loadingMore && !loading" :slim="true">
        <RowLoading class="my-2" />
      </Block>
    </template>
  </Layout>
</template>
