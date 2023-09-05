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
    class="relative block px-[20px] text-center md:flex md:px-3 md:pt-3 lg:block lg:pb-[24px]"
  >
    <div>
      <AvatarSpace :space="space" symbol-index="space" size="48" class="mr-3" />
      <div class="mt-2 truncate text-left">
        <h3 class="my-0 flex items-center text-2xl leading-[44px] lg:text-lg">
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
        <div class="text-md text-skin-text lg:text-base">
          {{
            $tc('members', space.followersCount, {
              count: formatCompactNumber(space.followersCount)
            })
          }}
        </div>
      </div>
    </div>

    <div
      class="mt-3 flex w-full items-end justify-end gap-[12px] md:mt-0 lg:mt-[12px]"
    >
      <ButtonFollow
        :space="space"
        :primary="!isFollowing"
        block
        class="w-full md:max-w-[180px] lg:max-w-none"
      />
      <BaseButtonRound
        v-if="isFollowing"
        class="inline shrink-0"
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

      <BaseButtonRound class="inline shrink-0 lg:hidden">
        <SpaceSidebarMenuThreeDot class="" />
      </BaseButtonRound>
    </div>
  </div>
</template>
