<script setup lang="ts">
import { onMounted } from 'vue';
import { useFollowSpace } from '@/composables/useFollowSpace';
import { useWeb3 } from '@/composables/useWeb3';
import { useNotifications } from '@/composables/useNotifications';
import { useI18n } from '@/composables/useI18n';
import { useIntl } from '@/composables/useIntl';

const { notifications, notificationsLoading, NotificationEvents } =
  useNotifications();
const { setPageTitle } = useI18n();
const { followingSpaces } = useFollowSpace();
const { formatRelativeTime, longRelativeTimeFormatter } = useIntl();
const { web3Account } = useWeb3();

// Initialize
onMounted(() => {
  setPageTitle('page.title.notifications');
});
</script>

<template>
  <Layout class="!mt-0">
    <template #content-left>
      <div class="py-4 px-4 md:px-0">
        <h2 v-text="$t('notifications.header')" class="mt-1" />
      </div>
      <div class="md:border-r md:border-l md:rounded-lg border-t border-b">
        <RowLoading v-if="notificationsLoading" class="px-4 py-5" />
        <div
          v-else-if="followingSpaces.length < 1 || !web3Account"
          class="text-center p-4"
        >
          <div class="mb-3">{{ $t('noSpacesJoined') }}</div>
          <router-link :to="{ path: '/' }">
            <UiButton>{{ $t('joinSpaces') }}</UiButton>
          </router-link>
        </div>
        <NoResults
          class="mt-4 mb-[24px]"
          v-else-if="notifications.length < 1"
          :block="false"
        />
        <div v-else>
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="transition-colors border-b last:!border-b-0"
          >
            <router-link
              class="p-3 block text-color"
              :to="{
                name: 'spaceProposal',
                params: { key: notification.spaceId, id: notification.id }
              }"
            >
              <div class="text-skin-text">
                <span
                  v-if="notification.event === NotificationEvents.ProposalStart"
                >
                  {{ $t('notifications.proposalStarted') }}
                </span>
                <span
                  v-if="notification.event === NotificationEvents.ProposalEnd"
                >
                  {{ $t('notifications.proposalEnded') }}
                </span>
              </div>
              <h3 v-text="notification.title" class="m-0" />
              <div class="text-skin-text mt-2">
                <span>
                  {{
                    formatRelativeTime(
                      notification.time,
                      longRelativeTimeFormatter
                    )
                  }}
                </span>
              </div>
            </router-link>
          </div>
        </div>
        <div
          style="height: 10px; width: 10px; position: absolute"
          ref="endElement"
        />
      </div>
    </template>
  </Layout>
</template>
