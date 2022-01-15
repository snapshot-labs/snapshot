<script setup>
import { ref, watchEffect } from 'vue';
import { useApp } from '@/composables/useApp';
import { n } from '@/helpers/utils';
import { useSpaceSubscription } from '@/composables/useSpaceSubscription';
import { useFollowSpace } from '@/composables/useFollowSpace';
import verified from '@/../snapshot-spaces/spaces/verified.json';

const props = defineProps({
  space: Object
});

const { explore } = useApp();

// TODO: Use space.followers instead of explore
const nbrMembers = explore.value.spaces[props.space.id].followers;
const isVerified = verified[props.space.id] || 0;

const {
  loading,
  toggleSubscription,
  isSubscribed,
  loadSubscriptions,
  subscriptions
} = useSpaceSubscription(props.space.id);

const { isFollowing } = useFollowSpace(props.space);

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
  <div class="text-center border-b bg-skin-header-bg">
    <Token :space="space" symbolIndex="space" size="80" class="mt-3 mb-2" />
    <h3 class="mb-[2px] mx-2">
      {{ space.name }}
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
      {{ $tc('members', nbrMembers, { count: n(nbrMembers) }) }}
    </div>
    <div class="flex justify-center gap-x-2">
      <FollowButton :space="space" />
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
