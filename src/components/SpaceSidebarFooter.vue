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
  <div class="text-center border-t bg-skin-header-bg mt-3">
    <div v-if="space">
      <h3 class="my-3 mx-2 flex justify-center items-center space-x-3">
        <a
          v-if="space.twitter"
          :href="`https://twitter.com/${space.twitter}`"
          target="_blank"
        >
          <Icon size="24" name="twitter" class="hover:opacity-80" />
        </a>
        <a
          v-if="space.github"
          :href="`https://github.com/${space.github}`"
          target="_blank"
        >
          <Icon size="24" name="github" class="hover:opacity-80" />
        </a>
      </h3>
    </div>
  </div>
</template>
