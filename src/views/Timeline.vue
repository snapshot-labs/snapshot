<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useInfiniteLoader } from '@/composables/useInfiniteLoader';
import { lsSet } from '@/helpers/utils';
import { useUnseenProposals } from '@/composables/useUnseenProposals';
import { useScrollMonitor } from '@/composables/useScrollMonitor';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { PROPOSALS_QUERY } from '@/helpers/queries';
import { useProfiles } from '@/composables/useProfiles';
import { useFollowSpace } from '@/composables/useFollowSpace';
import { useWeb3 } from '@/composables/useWeb3';
import verified from '@/../snapshot-spaces/spaces/verified.json';
import zipObject from 'lodash/zipObject';
import { useStore } from '@/composables/useStore';
import { useI18n } from '@/composables/useI18n';

const { store } = useStore();

const loading = ref(false);

const route = useRoute();
const { followingSpaces, loadingFollows } = useFollowSpace();
const { web3, web3Account } = useWeb3();
const { setPageTitle } = useI18n();

const spaces = computed(() => {
  const verifiedSpaces = Object.entries(verified)
    .filter(space => space[1] === 1)
    .map(space => space[0]);
  if (route.name === 'timeline') return followingSpaces.value;
  if (route.name === 'explore') return verifiedSpaces;
  else return [];
});

watch(spaces, () => {
  if (route.name === 'timeline' || route.name === 'explore') {
    store.timeline.proposals = [];
    load();
  }
});

const isTimeline = computed(() => route.name === 'timeline');

const { updateLastSeenProposal } = useUnseenProposals();
const { loadBy, loadingMore, stopLoadingMore, loadMore } = useInfiniteLoader();

const { endElement } = useScrollMonitor(() => {
  if (!web3Account.value && route.name === 'timeline') return;
  loadMore(() => loadProposals(store.timeline.proposals.length), loading.value);
});

const { apolloQuery } = useApolloQuery();
async function loadProposals(skip = 0) {
  const proposalsObj = await apolloQuery(
    {
      query: PROPOSALS_QUERY,
      variables: {
        first: loadBy,
        skip,
        space_in: spaces.value,
        state: store.timeline.filterBy
      }
    },
    'proposals'
  );
  stopLoadingMore.value = proposalsObj?.length < loadBy;
  store.timeline.proposals = store.timeline.proposals.concat(proposalsObj);
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

watch(
  [web3Account, followingSpaces],
  () => {
    emitUpdateLastSeenProposal();
  },
  { immediate: true }
);

// Initialize
onMounted(() => {
  load();
  setPageTitle('page.title.timeline');
});

async function load() {
  if (store.timeline.proposals.length > 0) return;
  if (!web3Account.value && route.name === 'timeline') return;
  loading.value = true;
  await loadProposals();
  loading.value = false;
}

const timelineFilterBy = computed(() => store.timeline.filterBy);

// Change filter
function selectState(e) {
  store.timeline.filterBy = e;
  store.timeline.proposals = [];
  load();
}
</script>

<template>
  <TheLayout class="!mt-0">
    <template #sidebar-right>
      <div style="position: fixed; width: 320px" class="mt-4 hidden lg:block">
        <BaseBlock :slim="true" class="overflow-hidden">
          <div class="py-3">
            <router-link
              :to="{ name: 'timeline' }"
              v-text="$t('joinedSpaces')"
              class="block px-4 py-2 sidenav-item"
            />
            <router-link
              :to="{ name: 'explore' }"
              v-text="$t('allSpaces')"
              class="block px-4 py-2 sidenav-item"
            />
          </div>
        </BaseBlock>
      </div>
    </template>
    <template #content-left>
      <div class="py-4 px-4 md:px-0 flex justify-between">
        <h2 v-text="$t('timeline')" class="mt-1" />
        <BaseDropdown
          @select="selectState"
          :items="[
            {
              text: $t('proposals.states.all'),
              action: 'all',
              selected: timelineFilterBy === 'all'
            },
            {
              text: $t('proposals.states.active'),
              action: 'active',
              selected: timelineFilterBy === 'active'
            },
            {
              text: $t('proposals.states.pending'),
              action: 'pending',
              selected: timelineFilterBy === 'pending'
            },
            {
              text: $t('proposals.states.closed'),
              action: 'closed',
              selected: timelineFilterBy === 'closed'
            }
          ]"
        >
          <template v-slot:button>
            <BaseButton class="pr-3">
              {{ $t(`proposals.states.${store.timeline.filterBy}`) }}
              <BaseIcon size="14" name="arrow-down" class="mt-1 mr-1" />
            </BaseButton>
          </template>
        </BaseDropdown>
      </div>
      <div class="md:rounded-lg bg-skin-block-bg md:border border-skin-border">
        <LoadingRow
          v-if="
            loading ||
            (web3.authLoading && isTimeline) ||
            (loadingFollows && isTimeline)
          "
        />
        <div
          v-else-if="
            (isTimeline && spaces.length < 1) || (isTimeline && !web3.account)
          "
          class="text-center p-4"
        >
          <div class="mb-3">{{ $t('noSpacesJoined') }}</div>
          <router-link :to="{ path: '/' }">
            <BaseButton>{{ $t('joinSpaces') }}</BaseButton>
          </router-link>
        </div>
        <NoResults
          class="py-4 mb-0"
          v-else-if="store.timeline.proposals.length < 1"
        />
        <div v-else>
          <TimelineProposalPreview
            v-for="(proposal, i) in store.timeline.proposals"
            :key="i"
            :proposal="proposal"
            :profiles="profiles"
            class="border-b first:border-t md:first:border-t-0"
          />
        </div>
        <div class="w-[10px] h-[10px] absolute bottom-0" ref="endElement" />
        <div v-if="loadingMore && !loading" :slim="true">
          <LoadingRow class="border-t" />
        </div>
      </div>
    </template>
  </TheLayout>
</template>
