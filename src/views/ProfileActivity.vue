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

onMounted(async () => {
  const votes = await apolloQuery(
    {
      query: ACTIVITY_VOTES_QUERY,
      variables: {
        first: 10,
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
    <h2>{{ $t('profile.activity.header') }}</h2>
    <BaseBlock :loading="queryLoading">
      <div class="space-y-3">
        <div v-if="activityToday.length">
          <h4>Today</h4>
          <div class="space-y-3">
            <ProfileActivityListItem
              v-for="activity in activityToday"
              :key="activity.id"
              :activity="activity"
            />
          </div>
        </div>
        <div v-if="activityOneWeek.length">
          <h4>This week</h4>
          <div class="space-y-3">
            <ProfileActivityListItem
              v-for="activity in activityOneWeek"
              :key="activity.id"
              :activity="activity"
            />
          </div>
        </div>
      </div>
    </BaseBlock>
  </div>
</template>
