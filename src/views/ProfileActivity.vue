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

onMounted(async () => {
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

  activities.value = votes;
});
</script>

<template>
  <div>
    <h2 class="px-4 md:px-0">{{ $t('profile.activity.header') }}</h2>

    <div class="space-y-3 mt-3">
      <ProfileActivityList title="TODAY" v-if="activityToday.length">
        <ProfileActivityListItem
          v-for="activity in activityToday"
          :key="activity.id"
          :activity="activity"
        />
      </ProfileActivityList>

      <ProfileActivityList title="THIS WEEK" v-if="activityOneWeek.length">
        <ProfileActivityListItem
          v-for="activity in activityOneWeek"
          :key="activity.id"
          :activity="activity"
        />
      </ProfileActivityList>

      <ProfileActivityList title="OLDER" v-if="activityOlder.length">
        <ProfileActivityListItem
          v-for="activity in activityOlder"
          :key="activity.id"
          :activity="activity"
        />
      </ProfileActivityList>
    </div>
  </div>
</template>
