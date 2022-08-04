<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { lsSet } from '@/helpers/utils';
import { PROPOSALS_QUERY } from '@/helpers/queries';
import verified from '@/../snapshot-spaces/spaces/verified.json';
import zipObject from 'lodash/zipObject';
import {
  useInfiniteLoader,
  useUnseenProposals,
  useScrollMonitor,
  useApolloQuery,
  useProfiles,
  useFollowSpace,
  useWeb3,
  useProposals,
  useI18n
} from '@/composables';

const loading = ref(false);

const route = useRoute();
const router = useRouter();
const { followingSpaces, loadingFollows } = useFollowSpace();
const { web3, web3Account } = useWeb3();
const { setPageTitle } = useI18n();

const {
  store,
  userVotedProposalIds,
  addTimelineProposals,
  setTimelineProposals
} = useProposals();

const spaces = computed(() => {
  const verifiedSpaces = Object.entries(verified)
    .filter(space => space[1] === 1)
    .map(space => space[0]);
  if (route.query.spaces === 'joined') return followingSpaces.value;
  else return verifiedSpaces;
});

const { updateLastSeenProposal } = useUnseenProposals();
const { loadBy, loadingMore, stopLoadingMore, loadMore } = useInfiniteLoader();

const { endElement } = useScrollMonitor(() => {
  if (!web3Account.value && route.name === 'timeline') return;
  loadMore(
    () => loadMoreProposals(store.timeline.proposals.length),
    loading.value
  );
});

const stateFilter = computed(() => route.query.state || 'all');
const isQueryJoinedSpaces = computed(() => route.query.spaces === 'joined');

const { apolloQuery } = useApolloQuery();
async function getProposals(skip = 0) {
  return apolloQuery(
    {
      query: PROPOSALS_QUERY,
      variables: {
        first: loadBy,
        skip,
        space_in: spaces.value,
        state: stateFilter.value
      }
    },
    'proposals'
  );
}

async function loadMoreProposals(skip = 0) {
  const proposals = await getProposals(skip);
  stopLoadingMore.value = proposals?.length < loadBy;
  addTimelineProposals(proposals);
}

async function loadProposals() {
  const proposals = await getProposals();
  setTimelineProposals(proposals);
}

const { profiles, loadProfiles } = useProfiles();
watch(store.timeline.proposals, () => {
  loadProfiles(store.timeline.proposals.map(proposal => proposal.author));
});

// Save the lastSeenProposal times for all spaces
function emitUpdateLastSeenProposal() {
  if (web3Account.value) {
    lsSet(
      `lastSeenProposals.${web3Account.value.slice(0, 8).toLowerCase()}`,
      zipObject(
        followingSpaces.value,
        Array(followingSpaces.value.length).fill(new Date().getTime())
      )
    );
  }
  updateLastSeenProposal(web3Account.value);
}

async function load() {
  if (!web3Account.value && isQueryJoinedSpaces.value) return;
  loading.value = true;
  await loadProposals();
  loading.value = false;
}

function setFilter(name: string) {
  setQuery('state', name);
}

function setQuery(filter: string, name: string) {
  router.push({
    query: {
      ...route.query,
      [filter]: name
    }
  });
}

watch(
  web3Account,
  () => {
    emitUpdateLastSeenProposal();
  },
  { immediate: true }
);

watch(
  () => [route.query.state, route.query.spaces],
  () => {
    load();
  },
  { immediate: true }
);

onMounted(() => {
  setPageTitle('page.title.timeline');
});
</script>

<template>
  <TheLayout class="!mt-0">
    <template #sidebar-left>
      <div class="fixed mt-4 hidden w-[240px] lg:block">
        <BaseBlock :slim="true" class="overflow-hidden">
          <div class="py-3">
            <BaseSidebarNavigationItem @click="setQuery('spaces', 'joined')">
              {{ $t('joinedSpaces') }}
            </BaseSidebarNavigationItem>

            <BaseSidebarNavigationItem @click="setQuery('spaces', 'all')">
              {{ $t('allSpaces') }}
            </BaseSidebarNavigationItem>
          </div>
        </BaseBlock>
      </div>
    </template>
    <template #content-right>
      <div class="flex justify-between px-4 pb-4 md:px-0">
        <h2 class="mt-1" v-text="$t('timeline')" />
        <BaseMenu
          :items="[
            {
              text: $t('proposals.states.all'),
              action: 'all',
              extras: { selected: stateFilter === 'all' }
            },
            {
              text: $t('proposals.states.active'),
              action: 'active',
              extras: { selected: stateFilter === 'active' }
            },
            {
              text: $t('proposals.states.pending'),
              action: 'pending',
              extras: { selected: stateFilter === 'pending' }
            },
            {
              text: $t('proposals.states.closed'),
              action: 'closed',
              extras: { selected: stateFilter === 'closed' }
            }
          ]"
          :selected="$t(`proposals.states.${stateFilter}`)"
          @select="setFilter"
        />
      </div>
      <div class="border-skin-border bg-skin-block-bg md:rounded-lg md:border">
        <LoadingRow v-if="loading || web3.authLoading || loadingFollows" />
        <div
          v-else-if="
            (isQueryJoinedSpaces && spaces.length < 1) ||
            (isQueryJoinedSpaces && !web3.account)
          "
          class="p-4 text-center"
        >
          <div class="mb-3">{{ $t('noSpacesJoined') }}</div>
          <router-link :to="{ path: '/' }">
            <BaseButton>{{ $t('joinSpaces') }}</BaseButton>
          </router-link>
        </div>
        <BaseNoResults
          v-else-if="store.timeline.proposals.length < 1"
          class="mb-0 py-4"
        />
        <div v-else>
          <BaseProposalPreviewItem
            v-for="(proposal, i) in store.timeline.proposals"
            :key="i"
            :proposal="proposal"
            :profiles="profiles"
            :voted="userVotedProposalIds.includes(proposal.id)"
            class="border-b first:border-t md:first:border-t-0"
          />
        </div>
        <div ref="endElement" class="absolute bottom-0 h-[10px] w-[10px]" />
        <div v-if="loadingMore && !loading" :slim="true">
          <LoadingRow class="border-t" />
        </div>
      </div>
    </template>
  </TheLayout>
</template>
