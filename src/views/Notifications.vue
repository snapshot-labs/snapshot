<script setup lang="ts">
import { useRoute } from 'vue-router';
import { onMounted, ref, computed, watch } from 'vue';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { NOTIFICATION_PROPOSALS_QUERY } from '@/helpers/queries';
import { useFollowSpace } from '@/composables/useFollowSpace';
import { useWeb3 } from '@/composables/useWeb3';
import { useStore } from '@/composables/useStore';
import { useI18n } from '@/composables/useI18n';
import { useIntl } from '@/composables/useIntl';

const loading = ref(false);

const route = useRoute();
const { notifications } = useStore();
const { setPageTitle } = useI18n();
const { followingSpaces, loadingFollows } = useFollowSpace();
const { formatRelativeTime, longRelativeTimeFormatter } = useIntl();
const { web3, web3Account } = useWeb3();

const NotificationEvents = {
  ProposalStart: 'proposal/start',
  ProposalEnd: 'proposal/end'
};

const spaces = computed(() => {
  return followingSpaces.value;
});

const notificationsSortedByEventTime = computed(() =>
  notifications.value?.sort((a, b) => b.time - a.time)
);

const { apolloQuery } = useApolloQuery();

async function loadProposals(state, date) {
  return (
    (await apolloQuery(
      {
        query: NOTIFICATION_PROPOSALS_QUERY,
        variables: {
          first: 100,
          state,
          space_in: spaces.value,
          start_gte: date
        }
      },
      'proposals'
    )) ?? []
  );
}

function mapProposalToNotifications(proposals) {
  if (proposals.length === 0) return;
  const now = Number(new Date().getTime() / 1000).toFixed(0);
  proposals.forEach(proposal => {
    notifications.value.push({
      id: proposal.id,
      event:
        proposal.end <= now
          ? NotificationEvents.ProposalEnd
          : NotificationEvents.ProposalStart,
      time: proposal.end <= now ? proposal.end : proposal.start,
      title: proposal.title,
      spaceId: proposal.space.id
    });
  });
}

async function loadRecentProposals() {
  const oneWeekAgo = Number((new Date().getTime() / 1000 - 604800).toFixed(0));
  const proposalsObj = await Promise.all([
    loadProposals('active', oneWeekAgo),
    loadProposals('closed', oneWeekAgo)
  ]);

  mapProposalToNotifications(proposalsObj.flat());
}

async function load() {
  if (notifications.value.length > 0) return;
  if (!web3Account.value) return;
  loading.value = true;
  await loadRecentProposals();
  loading.value = false;
}

watch(spaces, () => {
  if (route.name === 'notifications') {
    notifications.value = [];
    load();
  }
});

// Initialize
onMounted(() => {
  load();
  setPageTitle('page.title.notifications');
});
</script>

<template>
  <Layout class="!mt-0">
    <template #content-left>
      <div class="py-4 px-4 md:px-0">
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
          v-else-if="notifications.length < 1"
          :block="false"
        />
        <div v-else>
          <div
            v-for="notification in notificationsSortedByEventTime"
            :key="notification.id"
            class="transition-colors border-b last:!border-b-0"
          >
            <router-link
              class="p-3 block text-color"
              :to="{
                name: 'spaceProposal',
                params: { key: notification.spaceId, id: notification.id }
              }"
            >
              <div class="text-skin-text">
                <span
                  v-if="notification.event === NotificationEvents.ProposalStart"
                  >Proposal started</span
                >
                <span
                  v-if="notification.event === NotificationEvents.ProposalEnd"
                  >Proposal ended</span
                >
              </div>
              <h3 v-text="notification.title" class="m-0" />
              <div class="text-skin-text mt-2">
                <span>
                  {{
                    formatRelativeTime(
                      notification.time,
                      longRelativeTimeFormatter
                    )
                  }}
                </span>
              </div>
            </router-link>
          </div>
        </div>
        <div
          style="height: 10px; width: 10px; position: absolute"
          ref="endElement"
        />
      </div>
    </template>
  </Layout>
</template>
