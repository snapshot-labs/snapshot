<script setup>
import { computed, ref, watchEffect } from 'vue';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { useWeb3 } from '@/composables/useWeb3';
import { useApp } from '@/composables/useApp';
import { useSpaceSubscription } from '@/composables/useSpaceSubscription';
import { useFollowSpace } from '@/composables/useFollowSpace';
import { useIntl } from '@/composables/useIntl';
import verified from '@/../snapshot-spaces/spaces/verified.json';

const props = defineProps({
  space: Object
});

const auth = getInstance();
const { web3Account } = useWeb3();

const { explore } = useApp();

const { formatCompactNumber } = useIntl();

const nbrMembers = explore.value.spaces[props.space.id].followers;
const isVerified = verified[props.space.id] || 0;

const isAdmin = computed(() => {
  const admins = props.space?.admins?.map(address => address.toLowerCase());

  return (
    auth.isAuthenticated.value &&
    web3Account.value &&
    admins?.includes(web3Account.value.toLowerCase())
  );
});

const {
  loading,
  toggleSubscription,
  isSubscribed,
  loadSubscriptions,
  subscriptions
} = useSpaceSubscription(props.space.id);

const { isFollowing } = useFollowSpace(props.space);

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
  <div style="position: fixed; width: 240px">
    <Block :slim="true" class="overflow-hidden">
      <div class="text-center border-b bg-skin-header-bg">
        <Token :space="space" symbolIndex="space" size="80" class="mt-3 mb-2" />
        <h3 class="mb-[2px] mx-2">
          {{ space.name }}
          <Icon
            v-if="isVerified === 1"
            v-tippy="{
              content: $t('verifiedSpace'),
              placement: 'right'
            }"
            name="check"
            size="20"
          />
          <Icon v-if="isVerified === -1" name="warning" size="20" />
        </h3>
        <div class="mb-[12px] text-color">
          {{
            $tc('members', nbrMembers, {
              count: formatCompactNumber(nbrMembers)
            })
          }}
        </div>
        <div class="flex justify-center gap-x-2">
          <FollowButton :space="space" />
          <UiSidebarButton
            class="inline"
            v-if="isFollowing"
            @click="toggleSubscription()"
          >
            <UiLoading v-if="loading" />
            <Icon
              v-else
              size="20"
              class="link-color"
              :name="notificationIcon"
            />
          </UiSidebarButton>
        </div>
      </div>
      <div class="py-3">
        <router-link
          :to="{ name: 'spaceProposals', params: { key: space.id } }"
          v-text="$t('proposals.header')"
          :class="
            $route.name === 'spaceProposals' && 'router-link-exact-active'
          "
          class="block px-4 py-2 sidenav-item"
        />
        <router-link
          :to="{ name: 'spaceCreate', params: { key: space.id } }"
          v-text="$t('proposals.new')"
          class="block px-4 py-2 sidenav-item"
        />
        <router-link
          v-if="
            space.strategies?.find(strategy => strategy.name === 'delegation')
          "
          :to="{ name: 'delegate', params: { key: space.id } }"
          v-text="$t('delegate.header')"
          class="block px-4 py-2 sidenav-item"
        />
        <router-link
          :to="{ name: 'spaceAbout', params: { key: space.id } }"
          v-text="$t('about')"
          :class="$route.name === 'spaceAbout' && 'router-link-exact-active'"
          class="block px-4 py-2 sidenav-item"
        />
        <router-link
          v-if="isAdmin"
          :to="{ name: 'spaceSettings' }"
          v-text="$t('settings.header')"
          class="block px-4 py-2 sidenav-item"
        />
      </div>
    </Block>
  </div>
</template>
