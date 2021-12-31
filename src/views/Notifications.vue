<script setup>
import dayjs from 'dayjs';
import { useRoute } from 'vue-router';
import { onMounted, ref, computed, watch } from 'vue';

import { useInfiniteLoader } from '@/composables/useInfiniteLoader';
import { useScrollMonitor } from '@/composables/useScrollMonitor';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { NOTIFICATION_PROPOSALS_QUERY } from '@/helpers/queries';
import { useFollowSpace } from '@/composables/useFollowSpace';
import { useWeb3 } from '@/composables/useWeb3';
import { useStore } from '@/composables/useStore';
import { setPageTitle } from '@/helpers/utils';
import { useI18n } from 'vue-i18n';
import { getProposalPeriod } from '@/helpers/proposals';

const { store } = useStore();

const { t } = useI18n();

const loading = ref(false);

const route = useRoute();
const { followingSpaces, loadingFollows } = useFollowSpace();
const { web3, web3Account } = useWeb3();

const spaces = computed(() => {
  return followingSpaces.value;
});

const NotificationEvents = {
  ProposalStart: 'proposal/start',
  ProposalEnd: 'proposal/end'
};

watch(spaces, () => {
  if (route.name === 'notifications') {
    store.notifications.proposals = [];
    load();
  }
});

const { loadBy, loadingMore, stopLoadingMore, loadMore } = useInfiniteLoader();

const { endElement } = useScrollMonitor(() => {
  if (!web3Account.value && route.name === 'notifications') return;
  loadMore(
    () => loadRecentProposals(store.notifications.proposals.length),
    loading.value
  );
});

const { apolloQuery } = useApolloQuery();

async function loadRecentProposals(skip = 0) {
  const oneWeekAgo = dayjs().subtract(7, 'day').unix();
  const proposalsObj = await apolloQuery(
    {
      query: NOTIFICATION_PROPOSALS_QUERY,
      variables: {
        first: loadBy,
        skip,
        space_in: spaces.value,
        state: store.notifications.filterBy,
        start_gte: oneWeekAgo
      }
    },
    'proposals'
  );
  stopLoadingMore.value = proposalsObj?.length < loadBy;
  const newNotifications = mapProposalToNotifications(proposalsObj);
  store.notifications.proposals =
    store.notifications.proposals.concat(newNotifications);
}

function mapProposalToNotifications(proposals) {
  const notifications = [];
  const now = dayjs().unix();
  proposals.forEach(proposal => {
    notifications.push({
      ...proposal,
      event: NotificationEvents.ProposalStart,
      title: `${t('notifications.proposalTo')} ${proposal.title} ${t(
        'notifications.started'
      )}`
    });

    if (proposal.end <= now) {
      notifications.push({
        ...proposal,
        event: NotificationEvents.ProposalEnd,
        title: `${t('notifications.proposalTo')} ${proposal.title} ${t(
          'notifications.ended'
        )}`
      });
    }
  });
  return notifications;
}

// Initialize
onMounted(() => {
  load();
  setPageTitle('page.title.notifications');
});

async function load() {
  if (store.notifications.proposals.length > 0) return;
  if (!web3Account.value) return;
  loading.value = true;
  await loadRecentProposals();
  loading.value = false;
}

// Change filter
function selectState(filter) {
  store.notifications.filterBy = filter;
  store.notifications.proposals = [];
  load();
}
</script>

<template>
  <Layout class="!mt-0">
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
            {{ $t(`proposals.states.${store.notifications.filterBy}`) }}
            <Icon size="14" name="arrow-down" class="mt-1 mr-1" />
          </UiButton>
        </UiDropdown>
        <h2 v-text="$t('notifications.header')" class="mt-1" />
      </div>
      <div class="md:border-r md:border-l md:rounded-lg border-t border-b">
        <RowLoading
          v-if="loading || web3.authLoading || loadingFollows"
          class="px-4 py-5"
        />
        <div
          v-else-if="spaces.length < 1 || !web3.account"
          class="text-center p-4"
        >
          <div class="mb-3">{{ $t('noSpacesJoined') }}</div>
          <router-link :to="{ path: '/' }">
            <UiButton>{{ $t('joinSpaces') }}</UiButton>
          </router-link>
        </div>
        <NoResults
          class="mt-4 mb-[24px]"
          v-else-if="store.notifications.proposals.length < 1"
          :block="false"
        />
        <div v-else>
          <div
            v-for="proposal in store.notifications.proposals"
            :key="proposal.id"
            class="transition-colors border-b last-child-border-0"
          >
            <router-link
              class="p-4 block text-color"
              :to="{
                name: 'spaceProposal',
                params: { key: proposal.space.id, id: proposal.id }
              }"
            >
              <Token :space="proposal.space" size="28" />
              <span
                class="ml-2 group-hover:text-skin-link"
                v-text="proposal.space.name"
              />
              <h3 v-text="proposal.title" class="mt-2 mb-1" />
              <div>
                <UiState :state="proposal.state" slim class="mr-1" />
                {{ $t(`proposals.states.${proposal.state}`) }},
                <span
                  v-text="
                    $tc(getProposalPeriod(proposal), [
                      _toNow(proposal.end),
                      _ms(proposal.end)
                    ])
                  "
                />
              </div>
            </router-link>
          </div>
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
