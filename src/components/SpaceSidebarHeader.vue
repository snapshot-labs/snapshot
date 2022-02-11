<script setup>
import { ref, watchEffect, computed } from 'vue';
import { useSpaceSubscription } from '@/composables/useSpaceSubscription';
import { useFollowSpace } from '@/composables/useFollowSpace';
import verified from '@/../snapshot-spaces/spaces/verified.json';
import { useIntl } from '@/composables/useIntl';

const props = defineProps({
  space: Object,
  spaceId: String
});

const { formatCompactNumber } = useIntl();

const isVerified = computed(() => verified[props.spaceId] || 0);

const {
  loading,
  toggleSubscription,
  isSubscribed,
  loadSubscriptions,
  subscriptions
} = useSpaceSubscription(props.spaceId);

const { isFollowing } = useFollowSpace(props.spaceId);

const notificationIcon = ref('notifications-off');

watchEffect(() => {
  if (subscriptions.value === undefined) {
    loadSubscriptions();
  }
  if (isSubscribed.value) {
    notificationIcon.value = 'notifications-on';
  } else notificationIcon.value = 'notifications-off';
});
</script>

<template>
  <div class="text-center border-b bg-skin-header-bg h-[253px]">
    <div v-if="space">
      <Token :space="space" symbolIndex="space" size="80" class="mt-3 mb-2" />
      <h3 class="mb-[2px] mx-2 flex justify-center items-center">
        <div
          class="truncated mr-1"
          v-tippy="{
            content: space.name.length > 16 ? space.name : null
          }"
        >
          {{ space.name }}
        </div>
        <Icon
          v-if="isVerified === 1"
          v-tippy="{
            content: $t('verifiedSpace'),
            placement: 'right'
          }"
          name="check"
          size="20"
        />
        <Icon v-if="isVerified === -1" name="warning" size="20" />
      </h3>
      <div class="mb-[12px] text-color">
        {{
          $tc('members', space.followersCount, {
            count: formatCompactNumber(space.followersCount)
          })
        }}
      </div>
    </div>
    <div v-else class="pt-3 mb-2">
      <div class="h-[80px] w-[80px] mx-auto lazy-loading rounded-full" />

      <div
        class="bg-skin-text h-[28px] rounded-md lazy-loading mb-2 mt-3 w-[130px] mx-auto"
      />
      <div
        class="bg-skin-text h-[26px] rounded-md lazy-loading w-[100px] mb-2 mx-auto"
      />
    </div>
    <div class="flex justify-center gap-x-2">
      <FollowButton :space="space" :spaceId="spaceId" />
      <UiSidebarButton
        class="inline"
        v-if="isFollowing"
        @click="toggleSubscription()"
      >
        <UiLoading v-if="loading" />
        <Icon v-else size="20" class="link-color" :name="notificationIcon" />
      </UiSidebarButton>
    </div>
  </div>
</template>
