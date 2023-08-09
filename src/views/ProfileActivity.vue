<script setup lang="ts">
import { ACTIVITY_VOTES_QUERY } from '@/helpers/queries';
import { ProfileActivity } from '@/helpers/interfaces';
import { useInfiniteScroll } from '@vueuse/core';

const props = defineProps<{
  userAddress: string;
}>();

const { apolloQuery } = useApolloQuery();

const activities = ref<ProfileActivity[]>([]);
const loadingActivities = ref(false);

const activityToday = computed(() => {
  const oneDaySeconds = 24 * 60 * 60;
  return activities.value.filter(
    activity => activity.created > Math.floor(Date.now() / 1000) - oneDaySeconds
  );
});

const activityOneWeek = computed(() => {
  const oneDaySeconds = 24 * 60 * 60;
  const oneWeekSeconds = 7 * 24 * 60 * 60;
  return activities.value.filter(
    activity =>
      activity.created > Math.floor(Date.now() / 1000) - oneWeekSeconds &&
      activity.created < Math.floor(Date.now() / 1000) - oneDaySeconds
  );
});

const activityOlder = computed(() => {
  const oneWeekSeconds = 7 * 24 * 60 * 60;
  return activities.value.filter(
    activity =>
      activity.created < Math.floor(Date.now() / 1000) - oneWeekSeconds
  );
});

const { loadBy, loadingMore, stopLoadingMore, loadMore } =
  useInfiniteLoader(20);

async function loadVotes(skip = 0) {
  const votes = await apolloQuery(
    {
      query: ACTIVITY_VOTES_QUERY,
      variables: {
        first: loadBy,
        skip,
        voter: props.userAddress
      }
    },
    'votes'
  );

  stopLoadingMore.value = votes?.length < loadBy;

  votes.forEach(vote => {
    const isVisibleChoice = ['basic', 'single-choice'].includes(
      vote.proposal?.type ?? ''
    );

    activities.value.push({
      id: vote.id,
      created: vote.created,
      type: 'vote',
      title: vote.proposal.title,
      space: {
        id: vote.space.id,
        avatar: vote.space.avatar
      },
      vote: {
        proposalId: vote.proposal.id,
        choice: isVisibleChoice
          ? vote.proposal.choices?.[vote.choice - 1] ?? ''
          : '',
        type: vote.proposal.type
      }
    });
  });

  return votes;
}

useInfiniteScroll(
  document,
  () => {
    if (activities.value.length === 0) return;
    loadMore(() => loadVotes(activities.value.length));
  },
  { distance: 400 }
);

onMounted(async () => {
  loadingActivities.value = true;
  await loadVotes();
  loadingActivities.value = false;
});
</script>

<template>
  <div>
    <LoadingRow v-if="loadingActivities" block />

    <BaseBlock v-else-if="!activities.length" class="text-center">
      {{ $t('profile.activity.noActivity') }}
    </BaseBlock>

    <div v-else class="space-y-3">
      <ProfileActivityList
        v-if="activityToday.length"
        :title="$t('profile.activity.today')"
      >
        <ProfileActivityListItem
          v-for="activity in activityToday"
          :key="activity.id"
          :activity="activity"
        />
      </ProfileActivityList>

      <ProfileActivityList
        v-if="activityOneWeek.length"
        :title="$t('profile.activity.thisWeek')"
      >
        <ProfileActivityListItem
          v-for="activity in activityOneWeek"
          :key="activity.id"
          :activity="activity"
        />
      </ProfileActivityList>

      <ProfileActivityList
        v-if="activityOlder.length"
        :title="$t('profile.activity.olderThanWeek')"
      >
        <ProfileActivityListItem
          v-for="activity in activityOlder"
          :key="activity.id"
          :activity="activity"
        />
      </ProfileActivityList>

      <LoadingRow v-if="loadingMore" block />
    </div>
  </div>
</template>
