<script setup lang="ts">
import { computed } from 'vue';

const acitivityResults = {
  data: {
    activities: {
      seek: 1636995667,
      activities: [
        {
          id: 1,
          created: 1649590305,
          type: 'proposal_created',
          account: '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
          payload: {
            __typename: 'ProposalActivity',
            title: 'ACV',
            space: {
              name: 'midgerate.eth'
            }
          }
        },
        {
          id: 2,
          created: 1648998044,
          type: 'proposal_created',
          account: '0x04DB1bB49b7fFBcEC574f34D29c3153953890352',
          payload: {
            __typename: 'ProposalActivity',
            title: 'Simple',
            space: {
              name: 'midgerate.eth'
            }
          }
        },
        {
          id: 3,
          created: 1648999044,
          type: 'voted',
          account: '0x24F15402C6Bb870554489b2fd2049A85d75B982f',
          payload: {
            __typename: 'VoteActivity',
            choice: 1,
            space: {
              name: 'Thanku.eth Space'
            }
          }
        }
      ]
    }
  }
};

const activityToday = computed(() => {
  const oneDaySeconds = 24 * 60 * 60;
  return acitivityResults.data.activities.activities.filter(
    activity => activity.created > Math.floor(Date.now() / 1000) - oneDaySeconds
  );
});

const activityOneWeek = computed(() => {
  const oneDaySeconds = 24 * 60 * 60;
  const oneWeekSeconds = 7 * 24 * 60 * 60;
  return acitivityResults.data.activities.activities.filter(
    activity =>
      activity.created > Math.floor(Date.now() / 1000) - oneWeekSeconds &&
      activity.created < Math.floor(Date.now() / 1000) - oneDaySeconds
  );
});
</script>

<template>
  <div>
    <h2>{{ $t('profile.activity.header') }}</h2>
    <BaseBlock>
      <div class="space-y-3">
        <template v-if="activityToday.length">
          <h4>Today</h4>
          <ProfileActivityListItem
            v-for="activity in activityToday"
            :key="activity.id"
            :activity="activity"
          />
        </template>
        <template v-if="activityOneWeek.length">
          <h4>This week</h4>
          <ProfileActivityListItem
            v-for="activity in activityOneWeek"
            :key="activity.id"
            :activity="activity"
          />
        </template>
      </div>
    </BaseBlock>
  </div>
</template>
