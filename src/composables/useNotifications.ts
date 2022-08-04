/**
 * A componsable for handling proposal notifications and possibly more.
 * Seen proposals are stored in the local storage.
 */

import { watch, ref, computed, onBeforeUnmount } from 'vue';
import { NOTIFICATION_PROPOSALS_QUERY } from '@/helpers/queries';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { useFollowSpace } from '@/composables/useFollowSpace';
import { useWeb3 } from '@/composables/useWeb3';
import { useStorage } from '@vueuse/core';
import { useRouter } from 'vue-router';
import uniqBy from 'lodash/uniqBy';

interface Notification {
  id: string;
  event: string;
  time: number;
  title: string;
  space?: { id: string; name: string; avatar: string };
}

const notifications = ref<Notification[]>([]);
const loading = ref(false);
const selectedFilter = ref('all');

const NotificationEvents = {
  ProposalStart: 'proposal/start',
  ProposalEnd: 'proposal/end'
};
const filters = ['all', 'unread'];

export function useNotifications() {
  const router = useRouter();
  const { web3, web3Account } = useWeb3();
  const { followingSpaces, loadingFollows } = useFollowSpace();
  const { apolloQuery } = useApolloQuery();

  const notificationsLoading = computed(
    () => loading.value || web3.value.authLoading || loadingFollows.value
  );

  async function loadProposals(state, date) {
    if (followingSpaces.value.length === 0) return [];
    return (
      (await apolloQuery(
        {
          query: NOTIFICATION_PROPOSALS_QUERY,
          variables: {
            first: 100,
            state,
            space_in: followingSpaces.value,
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
      if (notifications.value.some(n => n.id === proposal.id)) return;
      notifications.value.push({
        id: proposal.id,
        event:
          proposal.end <= now
            ? NotificationEvents.ProposalEnd
            : NotificationEvents.ProposalStart,
        time: proposal.end <= now ? proposal.end : proposal.start,
        title: proposal.title,
        space: proposal.space
      });
    });
  }

  async function loadRecentProposals() {
    const unixTimestampTwoWeeksAgo = Number(
      (new Date().getTime() / 1000 - 604800 * 2).toFixed(0)
    );
    const proposalsObj = await Promise.all([
      loadProposals('active', unixTimestampTwoWeeksAgo),
      loadProposals('closed', unixTimestampTwoWeeksAgo)
    ]);

    mapProposalToNotifications(proposalsObj.flat());
  }

  async function loadNotifications() {
    if (notifications.value.length > 0) return;
    if (!web3Account.value) return;
    loading.value = true;
    await loadRecentProposals();
    loading.value = false;
  }

  // Reactive local storage with help from vueuse package
  const readNotificationsStorage = useStorage(
    `snapshot.unread.${web3Account.value.slice(0, 8).toLowerCase()}`,
    ['initialValue']
  );

  function selectNotification(id: string, spaceId: string) {
    router.push({
      name: 'spaceProposal',
      params: { key: spaceId, id: id }
    });
    readNotificationsStorage.value.push(id);
  }

  // Mark all notifications as read and remove duplicates from local storage
  function markAllAsRead() {
    readNotificationsStorage.value = readNotificationsStorage.value.concat(
      notifications.value.map(n => n.id)
    );
    readNotificationsStorage.value = uniqBy(readNotificationsStorage.value);
  }

  const notificationsSortedByTime = computed(() =>
    [
      ...notifications.value.map(n => ({
        text: n.title,
        action: { spaceId: n.space?.id, id: n.id },
        seen: readNotificationsStorage.value.includes(n.id),
        ...n
      }))
    ]
      .sort((a, b) => b.time - a.time)
      .filter(n => (selectedFilter.value === 'unread' ? !n.seen : true))
  );

  function reloadNotifications() {
    notifications.value = [];
    loadNotifications();
  }

  watch(followingSpaces, () => {
    reloadNotifications();
  });

  // Refresh notifications every 15 minutes and clear on unmount
  const refreshNotificationInterval = setInterval(
    reloadNotifications,
    60000 * 15
  );
  onBeforeUnmount(() => {
    clearInterval(refreshNotificationInterval);
  });

  return {
    notifications: computed(() => notifications.value),
    notificationsSortedByTime,
    notificationsLoading,
    NotificationEvents,
    selectedFilter,
    filters,
    loadNotifications,
    selectNotification,
    markAllAsRead
  };
}
