import { watch, ref, computed } from 'vue';
import { NOTIFICATION_PROPOSALS_QUERY } from '@/helpers/queries';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { useFollowSpace } from '@/composables/useFollowSpace';
import { useWeb3 } from '@/composables/useWeb3';

const { web3, web3Account } = useWeb3();
const { followingSpaces, loadingFollows } = useFollowSpace();
const { apolloQuery } = useApolloQuery();

interface Notification {
  id: string;
  event: string;
  time: number;
  title: string;
  spaceId?: string;
}

const notifications = ref<Notification[]>([]);
const loading = ref(false);

const notificationsLoading = computed(
  () => loading.value || web3.value.authLoading || loadingFollows.value
);

export function useNotifications() {
  const NotificationEvents = {
    ProposalStart: 'proposal/start',
    ProposalEnd: 'proposal/end'
  };

  async function loadProposals(state, date) {
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
    const unixTimestampTwoWeeksAgo = Number(
      (new Date().getTime() / 1000 - 604800 * 2).toFixed(0)
    );
    const proposalsObj = await Promise.all([
      loadProposals('active', unixTimestampTwoWeeksAgo),
      loadProposals('closed', unixTimestampTwoWeeksAgo)
    ]);

    mapProposalToNotifications(proposalsObj.flat());
  }

  watch(notifications, () =>
    notifications.value?.sort((a, b) => b.time - a.time)
  );

  async function loadNotifications() {
    if (notifications.value.length > 0) return;
    if (!web3Account.value) return;
    loading.value = true;
    await loadRecentProposals();
    loading.value = false;
  }

  watch(followingSpaces, () => {
    notifications.value = [];
    loadNotifications();
  });

  return {
    notifications,
    notificationsLoading,
    NotificationEvents,
    loadNotifications
  };
}
