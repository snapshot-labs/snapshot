<script setup lang="ts">
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
      <BaseButtonRound class="relative">
        <i-ho-bell class="text-skin-link" />
        <BaseIndicator
          v-if="notificationsSortedByTime.some(n => n.seen === false)"
          class="absolute bottom-0 right-0 !bg-red"
        />
      </BaseButtonRound>
    </template>
    <template #content>
      <div class="my-2 w-full">
        <div class="mb-3 flex items-center justify-between px-3">
          <h4>{{ $t('notifications.header') }}</h4>
          <BaseMenu
            :items="[
              {
                text: $t('notifications.markAllAsRead'),
                action: 'markAllAsRead'
              }
            ]"
            @select="selectThreedotItem"
          >
            <template #button>
              <button>
                <i-ho-dots-horizontal
                  class="cursor-pointer text-[22px] hover:text-skin-link"
                />
              </button>
            </template>
            <template #item="{ item }">
              <div class="flex items-center">
                <i-ho-check class="mr-2 text-sm" />

                {{ item.text }}
              </div>
            </template>
          </BaseMenu>
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
            <a
              tabindex="0"
              class="flex w-full cursor-pointer px-3 pb-2 pt-3 hover:bg-skin-border"
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
                  class="line-clamp-2 whitespace-normal leading-tight text-skin-link"
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
            </a>
          </template>
        </PopoverButton>
      </div>
    </template>
  </BasePopover>
</template>
