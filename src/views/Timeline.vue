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

const { timelineProposals } = useStore();

const filterBy = ref('all');
const loading = ref(false);

const route = useRoute();
const { followingSpaces, loadingFollows } = useFollowSpace();
const { web3 } = useWeb3();

const spaces = computed(() => {
  const verifiedSpaces = Object.entries(verified)
    .filter(space => space[1] === 1)
    .map(space => space[0]);
  if (route.name === 'timeline') return followingSpaces.value;
  if (route.name === 'explore') return verifiedSpaces;
  else return [];
});

watch(spaces, () => {
  if (spaces.value.length === 0) return;
  load();
});

const isTimeline = computed(() => route.name === 'timeline');

const { loadBy, limit, loadingMore, stopLoadingMore, loadMore } =
  useInfiniteLoader();

const { endElement } = useScrollMonitor(() =>
  loadMore(() => loadProposals(limit.value), loading.value)
);

const { apolloQuery } = useApolloQuery();
async function loadProposals(skip = 0) {
  const proposalsObj = await apolloQuery(
    {
      query: PROPOSALS_QUERY,
      variables: {
        first: loadBy,
        skip,
        space_in: spaces.value,
        state: filterBy.value
      }
    },
    'proposals'
  );
  stopLoadingMore.value = proposalsObj?.length < loadBy;
  timelineProposals.value = timelineProposals.value.concat(proposalsObj);
}

const { profiles, loadProfiles } = useProfiles();

watch(timelineProposals, () => {
  loadProfiles(timelineProposals.value.map(proposal => proposal.author));
});

// Initialize
onMounted(load());

async function load() {
  if (timelineProposals.value.length > 0) return;
  timelineProposals.value = [];
  loading.value = true;
  await loadProposals();
  loading.value = false;
}

// Change filter
function selectState(e) {
  filterBy.value = e;
  timelineProposals.value = [];
  limit.value = loadBy;
  load();
}

const { updateLastSeenProposal } = useUnseenProposals();

const web3Account = computed(() => web3.value.account);

// Save the lastSeenProposal times for all spaces
watch([timelineProposals, web3Account], () => {
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
});
</script>

<template>
  <Layout class="!mt-0">
    <template #sidebar-right>
      <div style="position: fixed; width: 320px" class="mt-4 hidden lg:block">
        <Block :slim="true" :title="$t('filters')" class="overflow-hidden">
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
        </Block>
      </div>
    </template>
    <template #content-left>
      <div class="py-4 px-4 md:px-0">
        <UiDropdown
          class="float-right"
          top="3.5rem"
          right="1.25rem"
          @select="selectState"
          :items="[
            { text: $t('proposals.states.all'), action: 'all' },
            { text: $t('proposals.states.active'), action: 'active' },
            { text: $t('proposals.states.pending'), action: 'pending' },
            { text: $t('proposals.states.closed'), action: 'closed' }
          ]"
        >
          <UiButton class="pr-3">
            {{ $t(`proposals.states.${filterBy}`) }}
            <Icon size="14" name="arrow-down" class="mt-1 mr-1" />
          </UiButton>
        </UiDropdown>
        <h2 v-text="$t('timeline')" class="mt-1" />
      </div>
      <div class="md:border-r md:border-l md:rounded-lg border-t border-b">
        <RowLoading
          v-if="
            loading ||
            (web3.authLoading && isTimeline) ||
            (loadingFollows && isTimeline)
          "
          class="px-4 py-5"
        />
        <div
          v-else-if="
            (isTimeline && spaces.length < 1) || (isTimeline && !web3.account)
          "
          class="text-center border-b p-4"
        >
          <div class="mb-3">{{ $t('noSpacesJoined') }}</div>
          <router-link :to="{ path: '/' }">
            <UiButton>{{ $t('joinSpaces') }}</UiButton>
          </router-link>
        </div>
        <NoResults v-else-if="timelineProposals.length < 1" :block="true" />
        <div v-else>
          <TimelineProposalPreview
            v-for="(proposal, i) in timelineProposals"
            :key="i"
            :proposal="proposal"
            :profiles="profiles"
          />
        </div>
        <div
          style="height: 10px; width: 10px; position: absolute"
          ref="endElement"
        />
        <div v-if="loadingMore && !loading" :slim="true">
          <RowLoading class="border-t px-4 py-5" />
        </div>
      </div>
    </template>
  </Layout>
</template>
