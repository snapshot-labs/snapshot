<script setup lang="ts">
import { PROPOSALS_QUERY } from '@/helpers/queries';
import { useInfiniteScroll } from '@vueuse/core';

useMeta({
  title: {
    key: 'metaInfo.timeline.title'
  },
  description: {
    key: 'metaInfo.timeline.description'
  }
});

const route = useRoute();
const router = useRouter();
const { followingSpaces, loadingFollows } = useFollowSpace();
const { web3, web3Account } = useWeb3();
const { apolloQuery } = useApolloQuery();
const { profiles, loadProfiles } = useProfiles();
const { loadBy, loadingMore, stopLoadingMore, loadMore } =
  useInfiniteLoader(12);

const {
  store,
  userVotedProposalIds,
  addTimelineProposals,
  setTimelineProposals
} = useProposals();

const loading = ref(false);

const stateFilter = computed(() => route.query.state || 'all');
const isFeedJoinedSpaces = computed(
  () => !route.query.feed || route.query.feed === 'joined'
);

async function getProposals(skip = 0) {
  if (!web3Account.value && isFeedJoinedSpaces.value) return [];

  const spaces = isFeedJoinedSpaces.value ? followingSpaces.value : undefined;

  const verified = route.query.feed === 'all' ? true : undefined;

  return (
    apolloQuery(
      {
        query: PROPOSALS_QUERY,
        variables: {
          first: loadBy,
          skip,
          space_in: spaces,
          state: stateFilter.value,
          space_verified: verified
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
  },
  { immediate: true }
);

watch(store.timeline.proposals, () => {
  loadProfiles(store.timeline.proposals.map(proposal => proposal.author));
});

useInfiniteScroll(
  document,
  () => {
    if (!store.timeline.proposals.length) return;
    loadMore(() => loadMoreProposals(store.timeline.proposals.length));
  },
  { distance: 500 }
);
</script>

<template>
  <TheLayout class="!mt-0">
    <template #sidebar-left>
      <div class="fixed hidden w-[240px] lg:block">
        <BaseBlock :slim="true" class="overflow-hidden">
          <div class="py-3">
            <a
              class="w-full text-left"
              tabindex="0"
              @click="setFeed('joined')"
              @keypress="setFeed('joined')"
            >
              <BaseSidebarNavigationItem :is-active="isFeedJoinedSpaces">
                {{ $t('joinedSpaces') }}
              </BaseSidebarNavigationItem>
            </a>

            <a
              class="w-full text-left"
              tabindex="0"
              @click="setFeed('all')"
              @keypress="setFeed('all')"
            >
              <BaseSidebarNavigationItem
                :is-active="route.query.feed === 'all'"
              >
                {{ $t('allSpaces') }}
              </BaseSidebarNavigationItem>
            </a>
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
            (isFeedJoinedSpaces && followingSpaces.length < 1) ||
            (isFeedJoinedSpaces && !web3.account)
          "
          class="p-4 text-center"
        >
          <div class="mb-3">{{ $t('noSpacesJoined') }}</div>
          <router-link :to="{ path: '/' }">
            <BaseButton tabindex="-1">{{ $t('joinSpaces') }}</BaseButton>
          </router-link>
        </div>
        <BaseNoResults
          v-else-if="store.timeline.proposals.length < 1"
          class="mb-0 py-4"
        />
        <div v-else>
          <ProposalsItem
            v-for="(proposal, i) in store.timeline.proposals"
            :key="i"
            :proposal="proposal"
            :space="proposal.space"
            :profiles="profiles"
            :voted="userVotedProposalIds.includes(proposal.id)"
            :to="{
              name: 'spaceProposal',
              params: { key: proposal.space.id, id: proposal.id }
            }"
            show-verified-icon
            class="border-b border-skin-border transition-colors first:border-t last:border-b-0 md:border-b md:first:border-t-0"
          />
        </div>

        <LoadingRow v-if="loadingMore" class="border-t" />
      </div>
    </template>
  </TheLayout>
</template>
