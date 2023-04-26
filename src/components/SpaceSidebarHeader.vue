<script setup>
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

const { t } = useI18n();
const { isFollowing } = useFollowSpace(props.space.id);

const notificationIcon = ref('notifications-off');

const threeDotItems = computed(() => {
  const items = [{ text: t('report'), action: 'report' }];
  return items;
});

function handleSelect(e) {
  if (!props.space) return;
  if (e === 'report') window.open('https://tally.so/r/mKzXo7', '_blank');
}

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
    class="relative block px-4 pt-4 text-center md:flex lg:block lg:px-0 lg:pt-0"
  >
    <div class="absolute -top-2 right-2">
      <BaseMenu class="md:ml-2" :items="threeDotItems" @select="handleSelect">
        <template #button>
          <div>
            <BaseButtonIcon :loading="isSending">
              <i-ho-dots-horizontal />
            </BaseButtonIcon>
          </div>
        </template>
        <template #item="{ item }">
          <div class="flex items-center gap-2">
            <i-ho-document-duplicate v-if="item.action === 'duplicate'" />
            <i-ho-flag v-if="item.action === 'report'" />
            <i-ho-trash v-if="item.action === 'delete'" />
            {{ item.text }}
          </div>
        </template>
      </BaseMenu>
    </div>
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
      <ButtonFollow :space="space" :primary="!isFollowing" />
      <BaseButton
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
      </BaseButton>
    </div>
  </div>
</template>
