<script setup>
import { ref, watchEffect } from 'vue';
import { useSpaceSubscription } from '@/composables/useSpaceSubscription';
import { useFollowSpace } from '@/composables/useFollowSpace';
import { useIntl } from '@/composables/useIntl';

const props = defineProps({
  space: {
    type: Object,
    default: null
  }
});

const { formatCompactNumber } = useIntl();

const {
  loading,
  toggleSubscription,
  isSubscribed,
  loadSubscriptions,
  subscriptions
} = useSpaceSubscription(props.space.id);

const { isFollowing } = useFollowSpace(props.space.id);

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
  <div class="h-[253px] text-center">
    <AvatarSpace
      :space="space"
      symbolIndex="space"
      size="80"
      class="mt-3 mb-2"
    />
    <h3 class="mx-3 mb-[2px] flex items-center justify-center">
      <div
        class="mr-1 truncate"
        v-tippy="{
          content: space.name.length > 16 ? space.name : null
        }"
      >
        {{ space.name }}
      </div>
      <IconVerifiedSpace :spaceId="props.space.id" />
    </h3>
    <div class="mb-[12px] text-skin-text">
      {{
        $tc('members', space.followersCount, {
          count: formatCompactNumber(space.followersCount)
        })
      }}
    </div>

    <div class="flex justify-center gap-x-2">
      <ButtonFollow :space="space" />
      <ButtonSidebar
        class="inline"
        v-if="isFollowing"
        @click="toggleSubscription()"
      >
        <LoadingSpinner v-if="loading" />
        <BaseIcon
          v-else
          size="20"
          class="text-skin-link"
          :name="notificationIcon"
        />
      </ButtonSidebar>
    </div>
  </div>
</template>
