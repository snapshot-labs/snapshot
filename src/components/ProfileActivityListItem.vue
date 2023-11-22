<script setup lang="ts">
import { ProfileActivity } from '@/helpers/interfaces';

const { formatRelativeTime, longRelativeTimeFormatter } = useIntl();

defineProps<{ activity: ProfileActivity }>();
</script>

<template>
  <div class="border-b border-skin-text last:border-b-0">
    <!-- Vote activities -->
    <router-link
      v-if="activity.type === 'vote'"
      :to="{
        name: 'spaceProposal',
        params: { key: activity.space.id, id: activity.vote?.proposalId }
      }"
    >
      <div class="flex w-full px-4 py-4">
        <div class="relative min-w-[52px]">
          <AvatarSpace size="44" :space="activity.space" />
          <div
            class="absolute right-0 top-[24px] rounded-full bg-primary p-[6px] pr-[5px] text-[9px] text-white"
          >
            <i-s-signature />
          </div>
        </div>
        <div class="ml-4 w-[calc(100%-64px)]">
          <div class="flex text-xs leading-5 text-skin-text">
            <div class="flex-grow">
              {{
                $t('profile.activity.votedFor', {
                  choice: activity.vote?.choice
                    ? `"${activity.vote?.choice}"`
                    : ''
                })
              }}
            </div>
            <div
              v-tippy="{
                content: new Date(activity.created * 1000).toUTCString()
              }"
              class="cursor-help"
            >
              {{
                formatRelativeTime(activity.created, longRelativeTimeFormatter)
              }}
            </div>
          </div>
          <div class="truncate pr-2">
            {{ activity.title }}
          </div>
        </div>
      </div>
    </router-link>
    <!-- Other activities -->
  </div>
</template>
