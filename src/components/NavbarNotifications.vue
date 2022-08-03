<script setup lang="ts">
import { onMounted } from 'vue';
import { useNotifications } from '@/composables/useNotifications';
import { useIntl } from '@/composables/useIntl';
import { PopoverButton } from '@headlessui/vue';

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

function selectThreedotItem(e) {
  if (e === 'markAllAsRead') markAllAsRead();
}

onMounted(() => loadNotifications());
</script>

<template>
  <BasePopover>
    <template #button>
      <ButtonSidebar class="relative !h-[46px] !w-[46px]">
        <i-ho-bell class="text-skin-link" />
        <BaseIndicator
          v-if="notificationsSortedByTime.some(n => n.seen === false)"
          class="absolute right-0 bottom-0 !bg-red"
        />
      </ButtonSidebar>
    </template>
    <template #content>
      <div class="my-2 w-full">
        <div class="mb-3 flex items-center justify-between px-3">
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
            <template #button>
              <i-ho-dots-horizontal
                class="cursor-pointer text-[22px] hover:text-skin-link"
              />
            </template>
            <template #item="{ item }">
              <div class="flex items-center">
                <i-ho-check class="mr-2 text-sm" />

                {{ item.text }}
              </div>
            </template>
          </BaseDropdown>
        </div>
        <div class="mb-3 space-x-2 px-3">
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

        <PopoverButton
          v-for="item in notificationsSortedByTime"
          :key="item.id"
          as="div"
        >
          <template v-if="item.space">
            <div
              class="flex w-full cursor-pointer px-3 pt-3 pb-2 hover:bg-skin-border"
              @click="selectNotification(item.id, item.space!.id)"
            >
              <div class="hidden w-[78px] sm:block">
                <AvatarSpace :space="item.space" size="44" class="-ml-2" />
              </div>
              <div class="w-full">
                <div class="flex leading-tight">
                  <div class="max-w-[110px] truncate text-skin-link">
                    {{ item.space.name }}
                  </div>
                  <div class="ml-1 text-skin-text">
                    <span
                      v-if="item.event === NotificationEvents.ProposalStart"
                    >
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
                    {{
                      formatRelativeTime(item.time, longRelativeTimeFormatter)
                    }}
                  </span>
                </div>
              </div>
              <div class="ml-2 flex w-[12px] items-center">
                <BaseIndicator v-if="!item.seen" />
              </div>
            </div>
          </template>
        </PopoverButton>
      </div>
    </template>
  </BasePopover>
</template>
