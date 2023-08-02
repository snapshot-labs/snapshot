<script setup lang="ts">
import { Space, ExtendedSpace } from '@/helpers/interfaces';
const props = defineProps<{
  space: Space | ExtendedSpace;
}>();

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
  <div
    class="relative block px-4 pt-4 text-center md:flex lg:block lg:px-3 lg:pt-0"
  >
    <div class="flex lg:block">
      <AvatarSpace
        :space="space"
        symbol-index="space"
        size="48"
        class="mr-3 !justify-start lg:mb-0 lg:mr-0 lg:mt-3"
      />
      <div
        class="flex flex-col justify-center truncate text-left lg:block lg:text-left"
      >
        <h3 class="mb-[2px] flex items-center lg:justify-start">
          <div
            v-tippy="{
              content: space.name.length > 16 ? space.name : null
            }"
            class="mr-1 truncate"
          >
            {{ space.name }}
          </div>
          <IconVerifiedSpace v-if="space.verified" />
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
      class="flex flex-grow items-start justify-end gap-x-[12px] lg:mb-4 lg:justify-start"
    >
      <ButtonFollow
        :space="space"
        block
        class="w-[140px] max-w-[140px] lg:w-full lg:max-w-none"
        :primary="!isFollowing"
      />
      <BaseButtonRound
        v-if="isFollowing"
        class="inline !h-[46px] !w-[46px] shrink-0"
        @click="toggleSubscription()"
      >
        <LoadingSpinner v-if="loading" />
        <BaseIcon
          v-else
          size="20"
          class="text-skin-link"
          :name="notificationIcon"
        />
      </BaseButtonRound>
    </div>
  </div>
</template>
