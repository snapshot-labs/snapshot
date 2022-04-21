<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { ACTIVITY_VOTES_QUERY } from '@/helpers/queries';
import { ProfileActivity } from '@/helpers/interfaces';

const props = defineProps<{
  userAddress: string;
}>();

const { apolloQuery, queryLoading } = useApolloQuery();

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

async function loadVotes() {
  const votes = await apolloQuery(
    {
      query: ACTIVITY_VOTES_QUERY,
      variables: {
        first: 6,
        voter: props.userAddress
      }
    },
    'votes'
  );

  return votes;
}

function mergeInToActivities(responseArray: any[]) {
  const votes = responseArray[0];
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
}

onMounted(async () => {
  const allResponses = await Promise.all([await loadVotes()]);
  mergeInToActivities(allResponses);
});
</script>

<template>
  <div>
    <div class="space-y-3">
      <BaseBlock v-if="queryLoading" slim>
        <LoadingRow />
      </BaseBlock>
      <template v-else>
        <ProfileActivityList
          :title="$t('profile.activity.today')"
          v-if="activityToday.length"
        >
          <ProfileActivityListItem
            v-for="activity in activityToday"
            :key="activity.id"
            :activity="activity"
          />
        </ProfileActivityList>

        <ProfileActivityList
          :title="$t('profile.activity.thisWeek')"
          v-if="activityOneWeek.length"
        >
          <ProfileActivityListItem
            v-for="activity in activityOneWeek"
            :key="activity.id"
            :activity="activity"
          />
        </ProfileActivityList>

        <ProfileActivityList
          :title="$t('profile.activity.older')"
          v-if="activityOlder.length"
        >
          <ProfileActivityListItem
            v-for="activity in activityOlder"
            :key="activity.id"
            :activity="activity"
          />
        </ProfileActivityList>
      </template>
    </div>
  </div>
</template>
