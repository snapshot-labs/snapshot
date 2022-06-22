<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useNotifications } from '@/composables/useNotifications';
import { useIntl } from '@/composables/useIntl';

const {
  notificationsLoading,
  NotificationEvents,
  notificationsSortedByTime,
  selectedFilter,
  filters,
  selectNotification,
  markAllAsRead,
  loadNotifications
} = useNotifications();

const { formatRelativeTime, longRelativeTimeFormatter } = useIntl();

const dropdownOpen = ref(false);

function selectThreedotItem(e) {
  if (e === 'markAllAsRead') markAllAsRead();
}

onMounted(() => loadNotifications());
</script>

<template>
  <BaseDropdown
    :items="notificationsSortedByTime"
    placement="bottom-end"
    @select="selectNotification"
    @openChange="dropdownOpen = !dropdownOpen"
  >
    <template #button>
      <ButtonSidebar
        class="relative !h-[46px] !w-[46px]"
        :class="{ '!border-skin-link': dropdownOpen }"
      >
        <BaseIcon class="text-skin-link" size="20" name="notificationsnone" />
        <BaseIndicator
          v-if="notificationsSortedByTime.some(n => n.seen === false)"
          class="absolute right-0 bottom-0 !bg-red"
        />
      </ButtonSidebar>
    </template>
    <template #header>
      <div class="my-2 min-w-[320px] px-3 md:min-w-[400px]">
        <div class="mb-3 flex items-center justify-between">
          <h4>{{ $t('notifications.header') }}</h4>
          <BaseDropdown
            :items="[
              {
                text: $t('notifications.markAllAsRead'),
                action: 'markAllAsRead'
              }
            ]"
            placement="bottom-end"
            @select="selectThreedotItem"
          >
            <template #button>
              <BaseIcon
                name="threedots"
                size="25"
                class="cursor-pointer hover:text-skin-link"
              />
            </template>
            <template #item="{ item }">
              <div class="flex items-center">
                <BaseIcon name="check1" size="22" class="mr-2" />
                {{ item.text }}
              </div>
            </template>
          </BaseDropdown>
        </div>
        <div class="space-x-2">
          <BaseButton
            v-for="filter in filters"
            :key="filter"
            class="!h-[44px]"
            :class="{ '!border-skin-link': selectedFilter === filter }"
            @click="selectedFilter = filter"
          >
            {{ $t(`notifications.${filter}`) }}
          </BaseButton>
        </div>
        <div v-if="!notificationsSortedByTime.length && notificationsLoading">
          <LoadingRow class="!px-0" />
        </div>
        <div
          v-else-if="!notificationsSortedByTime.length"
          class="pb-3 pt-4 text-center"
        >
          <h4 class="text-skin-text">
            {{ $t('notifications.noNotifications') }}
          </h4>
        </div>
      </div>
    </template>
    <template #item="{ item }">
      <div class="flex pt-2 pb-1">
        <div class="flex w-full">
          <div class="w-[78px]">
            <AvatarSpace :space="item.space" size="44" />
          </div>
          <div class="w-full">
            <div class="flex leading-tight">
              <div
                class="max-w-[60px] truncate text-skin-link md:max-w-[120px]"
              >
                {{ item.space.name }}
              </div>
              <div class="ml-1 text-skin-text">
                <span v-if="item.event === NotificationEvents.ProposalStart">
                  {{ $t('notifications.proposalStarted') }}
                </span>
                <span v-if="item.event === NotificationEvents.ProposalEnd">
                  {{ $t('notifications.proposalEnded') }}
                </span>
              </div>
            </div>
            <div
              class="whitespace-normal leading-tight text-skin-link line-clamp-2"
            >
              "{{ item.text }}"
            </div>
            <div class="leading-normal text-skin-text">
              <span>
                {{ formatRelativeTime(item.time, longRelativeTimeFormatter) }}
              </span>
            </div>
          </div>
          <div class="ml-2 flex w-[12px] items-center">
            <BaseIndicator v-if="!item.seen" />
          </div>
        </div>
      </div>
    </template>
  </BaseDropdown>
</template>
