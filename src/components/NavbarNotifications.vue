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
    @select="selectNotification"
    @openChange="dropdownOpen = !dropdownOpen"
    :items="notificationsSortedByTime"
  >
    <template v-slot:button>
      <UiSidebarButton
        class="!h-[46px] !w-[46px] relative"
        :class="{ '!border-skin-link': dropdownOpen }"
      >
        <BaseIcon class="text-skin-link" size="20" name="notificationsnone" />
        <span
          v-if="notificationsSortedByTime.some(n => n.seen === false)"
          class="absolute right-0 bottom-0 s-indicator !bg-red"
        />
      </UiSidebarButton>
    </template>
    <template v-slot:header>
      <div class="px-3 my-2 min-w-[320px] md:min-w-[400px]">
        <div class="flex justify-between items-center mb-3">
          <h4>{{ $t('notifications.header') }}</h4>
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
              <BaseIcon
                name="threedots"
                size="25"
                class="cursor-pointer hover:text-skin-link"
              />
            </template>
            <template v-slot:item="{ item }">
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
            @click="selectedFilter = filter"
            class="!h-[44px]"
            :class="{ '!border-skin-link': selectedFilter === filter }"
            no-focus
          >
            {{ $t(`notifications.${filter}`) }}
          </BaseButton>
        </div>
        <div v-if="!notificationsSortedByTime.length && notificationsLoading">
          <LoadingRow class="!px-0" />
        </div>
        <div
          v-else-if="!notificationsSortedByTime.length"
          class="text-center pb-3 pt-4"
        >
          <h4 class="text-skin-text">
            {{ $t('notifications.noNotifications') }}
          </h4>
        </div>
      </div>
    </template>
    <template v-slot:item="{ item }">
      <div class="flex pt-2 pb-1">
        <div class="flex w-full">
          <div class="pr-2 -ml-1">
            <AvatarSpace :space="item.space" size="44" />
          </div>
          <div class="w-full">
            <div class="leading-tight flex">
              <div
                class="text-skin-link max-w-[60px] md:max-w-[120px] truncate"
              >
                {{ item.space.name }}
              </div>
              <div class="text-skin-text ml-1">
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
          <div class="flex items-center w-[12px] ml-2">
            <span v-if="!item.seen" class="s-indicator bg-primary"></span>
          </div>
        </div>
      </div>
    </template>
  </BaseDropdown>
</template>
