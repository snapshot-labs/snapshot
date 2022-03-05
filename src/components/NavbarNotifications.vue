<script setup lang="ts">
import { ref } from 'vue';
import { useNotifications } from '@/composables/useNotifications';
import { useIntl } from '@/composables/useIntl';

const {
  notifications,
  notificationsLoading,
  NotificationEvents,
  notificationsSortedByTime,
  selectedFilter,
  filters,
  selectNotification,
  markAllAsRead
} = useNotifications();

const { formatRelativeTime, longRelativeTimeFormatter } = useIntl();

const dropdownOpen = ref(false);

function selectThreedotItem(e) {
  if (e === 'markAllAsRead') markAllAsRead();
}
</script>

<template>
  <BaseDropdown
    @select="selectNotification"
    @openChange="dropdownOpen = !dropdownOpen"
    :items="notificationsSortedByTime"
  >
    <template v-slot:button>
      <UiSidebarButton
        v-if="!notificationsLoading && notifications.length > 0"
        class="!h-[46px] !w-[46px] relative"
        :class="{ '!border-skin-link': dropdownOpen }"
      >
        <Icon class="text-skin-link" size="20" name="notifications-none" />
        <span
          v-if="notificationsSortedByTime.some(n => n.seen === false)"
          class="absolute right-0 bottom-0 s-indicator !bg-red"
        />
      </UiSidebarButton>
    </template>
    <template v-slot:header>
      <div class="px-3 my-2 min-w-[320px] md:min-w-[400px]">
        <div class="flex justify-between items-center">
          <h2>{{ $t('notifications.header') }}</h2>
          <BaseDropdown
            :items="[
              {
                text: $t('notifications.markAllAsRead'),
                action: 'markAllAsRead'
              }
            ]"
            @select="selectThreedotItem"
          >
            <template v-slot:button>
              <Icon
                name="threedots"
                size="25"
                class="cursor-pointer hover:text-skin-link"
              />
            </template>
            <template v-slot:item="{ item }">
              <div class="flex items-center">
                <Icon name="check1" size="22" class="mr-2" />
                {{ item.text }}
              </div>
            </template>
          </BaseDropdown>
        </div>
        <div class="space-x-2">
          <UiButton
            v-for="filter in filters"
            :key="filter"
            @click="selectedFilter = filter"
            class="capitalize !h-[44px]"
            :class="{ '!border-skin-link': selectedFilter === filter }"
            no-focus
          >
            {{ filter }}
          </UiButton>
        </div>
        <div
          v-if="!notificationsSortedByTime.length"
          class="text-center pb-3 pt-4"
        >
          <h3 class="text-skin-text">You have no notifications</h3>
        </div>
      </div>
    </template>
    <template v-slot:item="{ item }">
      <div class="flex pt-2 pb-1">
        <div class="flex">
          <div class="pr-2 -ml-1">
            <Token :space="item.space" size="45" />
          </div>
          <div class="w-[210px] md:w-[270px]">
            <div class="leading-tight w-full flex">
              <div class="text-skin-link max-w-5/12 truncate">
                {{ item.space.name }}
              </div>
              <div class="text-skin-text ml-1 min-w-7/12">
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
            <div class="text-skin-text leading-normal">
              <span>
                {{ formatRelativeTime(item.time, longRelativeTimeFormatter) }}
              </span>
            </div>
          </div>
        </div>
        <div class="flex items-center">
          <span v-if="!item.seen" class="s-indicator bg-primary"></span>
          <span v-else class="w-[12px]"></span>
        </div>
      </div>
    </template>
  </BaseDropdown>
</template>
