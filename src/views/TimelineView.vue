<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { PROPOSALS_QUERY } from '@/helpers/queries';
import verified from '@/../snapshot-spaces/spaces/verified.json';
import {
  useInfiniteLoader,
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

const stateFilter = computed(() => route.query.state || 'all');
const isFeedJoinedSpaces = computed(
  () => !route.query.feed || route.query.feed === 'joined'
);

const spaces = computed(() => {
  const verifiedSpaces = Object.entries(verified)
    .filter(space => space[1] === 1)
    .map(space => space[0]);
  if (isFeedJoinedSpaces.value) return followingSpaces.value;
  else return verifiedSpaces;
});

const { loadBy, loadingMore, stopLoadingMore, loadMore } = useInfiniteLoader();

const { apolloQuery } = useApolloQuery();
async function getProposals(skip = 0) {
  if (!web3Account.value && isFeedJoinedSpaces.value) return [];

  return (
    apolloQuery(
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
    ) ?? []
  );
}

async function loadMoreProposals(skip: number) {
  const proposals = await getProposals(skip);
  stopLoadingMore.value = proposals?.length < loadBy;
  addTimelineProposals(proposals);
}

async function loadProposals() {
  if (route.name !== 'timeline') return;
  loading.value = true;
  const proposals = await getProposals();
  setTimelineProposals(proposals);
  loading.value = false;
}

const { profiles, loadProfiles } = useProfiles();
watch(store.timeline.proposals, () => {
  loadProfiles(store.timeline.proposals.map(proposal => proposal.author));
});

function setStateFilter(name: string) {
  router.push({
    query: {
      ...route.query,
      ['state']: name
    }
  });
}

function setFeed(name: string) {
  router.push({
    query: {
      ...route.query,
      ['feed']: name
    }
  });
}

watch(
  () => [route.query.state, route.query.feed, followingSpaces.value],
  () => {
    loadProposals();
  }
);

onMounted(() => {
  if (store.timeline.proposals.length > 0) return;
  loadProposals();
});

onMounted(() => {
  setPageTitle('page.title.timeline');
});

const { endElement } = useScrollMonitor(() => {
  if (loading.value) return;
  loadMore(() => loadMoreProposals(store.timeline.proposals.length));
});
</script>

<template>
  <TheLayout class="!mt-0">
    <template #sidebar-left>
      <div class="fixed hidden w-[240px] lg:block">
        <BaseBlock :slim="true" class="overflow-hidden">
          <div class="py-3">
            <BaseSidebarNavigationItem
              :is-active="isFeedJoinedSpaces"
              @click="setFeed('joined')"
            >
              {{ $t('joinedSpaces') }}
            </BaseSidebarNavigationItem>

            <BaseSidebarNavigationItem
              :is-active="route.query.feed === 'all'"
              @click="setFeed('all')"
            >
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
          @select="setStateFilter"
        />
      </div>
      <div class="border-skin-border bg-skin-block-bg md:rounded-lg md:border">
        <LoadingRow v-if="loading || web3.authLoading || loadingFollows" />
        <div
          v-else-if="
            (isFeedJoinedSpaces && spaces.length < 1) ||
            (isFeedJoinedSpaces && !web3.account)
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
          <TimelineProposalsItem
            v-for="(proposal, i) in store.timeline.proposals"
            :key="i"
            :proposal="proposal"
            :profiles="profiles"
            :voted="userVotedProposalIds.includes(proposal.id)"
            class="border-b first:border-t md:first:border-t-0"
          />
        </div>
        <div class="relative">
          <div ref="endElement" class="absolute h-[10px] w-[10px]" />
        </div>
        <div v-if="loadingMore">
          <LoadingRow class="border-t" />
        </div>
      </div>
    </template>
  </TheLayout>
</template>
