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
  <div class="block px-4 pt-4 text-center md:flex lg:block lg:px-0 lg:pt-0">
    <div class="flex lg:block">
      <AvatarSpace
        :space="space"
        symbol-index="space"
        size="80"
        class="lg:my-3"
      />
      <div
        class="mx-3 flex flex-col justify-center truncate text-left lg:block lg:text-center"
      >
        <h3 class="mb-[2px] flex items-center lg:justify-center">
          <div
            v-tippy="{
              content: space.name.length > 16 ? space.name : null
            }"
            class="mr-1 truncate"
          >
            {{ space.name }}
          </div>
          <IconVerifiedSpace :space-id="props.space.id" />
        </h3>
        <div class="mb-[12px] text-skin-text">
          {{
            $tc('members', space.followersCount, {
              count: formatCompactNumber(space.followersCount)
            })
          }}
        </div>
      </div>
    </div>

    <div
      class="flex flex-grow items-start justify-end gap-x-2 lg:mb-4 lg:justify-center"
    >
      <ButtonFollow :space="space" />
      <ButtonSidebar
        v-if="isFollowing"
        class="inline"
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
