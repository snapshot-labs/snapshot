<script setup lang="ts">
import { ref, computed } from 'vue';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { ACTIVITY_VOTES_QUERY } from '@/helpers/queries';
import { ProfileActivity } from '@/helpers/interfaces';
import { useInfiniteLoader } from '@/composables/useInfiniteLoader';
import { useScrollMonitor } from '@/composables/useScrollMonitor';

const props = defineProps<{
  userAddress: string;
}>();

const { apolloQuery } = useApolloQuery();

const activities = ref<ProfileActivity[]>([]);

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
const { endElement } = useScrollMonitor(() =>
  loadMore(() => loadVotes(activities.value.length))
);

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
        choice: vote.proposal.choices[vote.choice - 1],
        type: vote.proposal.type
      }
    });
  });

  return votes;
}
</script>

<template>
  <div>
    <div class="space-y-3">
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
        :title="$t('profile.activity.older')"
      >
        <ProfileActivityListItem
          v-for="activity in activityOlder"
          :key="activity.id"
          :activity="activity"
        />
      </ProfileActivityList>

      <LoadingRow v-if="loadingMore" block />

      <BaseBlock v-else-if="!activities.length" class="text-center">
        {{ $t('profile.activity.noActivity') }}
      </BaseBlock>
    </div>
    <div class="relative">
      <div ref="endElement" class="absolute h-[10px] w-[10px]" />
    </div>
  </div>
</template>
