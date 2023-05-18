<script setup lang="ts">
const props = defineProps<{
  address: string;
}>();

const emit = defineEmits(['switchWallet']);
const { t } = useI18n();

const { domain } = useApp();
const { logout } = useWeb3();
const { isSubscribed } = useEmailSubscription();
const router = useRouter();
const modalEmailSubscriptionOpen = ref(false);

function handleAction(e) {
  if (e === 'viewProfile')
    // Link to profile page, if on custom domain then the link is external
    return domain
      ? window.open(`https://snapshot.org/#/profile/${props.address}`, '_blank')
      : router.push({
          name: 'profileActivity',
          params: { address: props.address }
        });
  if (e === 'switchWallet') return emit('switchWallet');
  if (e === 'delegate')
    return router.push({
      name: 'delegate'
    });
  if (e === 'subscribeEmail') {
    modalEmailSubscriptionOpen.value = true;
    return true;
  }
  return logout();
}
</script>

<template>
  <div>
    <BaseMenu
      :items="[
        {
          text: 'View profile',
          action: 'viewProfile',
          extras: { icon: 'profile' }
        },
        {
          text: 'Delegate',
          action: 'delegate',
          extras: { icon: 'user-add' }
        },
        {
          text: 'Switch wallet',
          action: 'switchWallet',
          extras: { icon: 'switch' }
        },
        {
          text: isSubscribed
            ? 'Manage subscriptions'
            : t('emailSubscription.subscribe'),
          action: 'subscribeEmail',
          extras: { icon: 'mail' }
        },
        { text: 'Log out', action: 'logout', extras: { icon: 'logout' } }
      ]"
      @select="handleAction($event)"
    >
      <template #button>
        <slot />
      </template>
      <template #item="{ item }">
        <div class="flex items-center space-x-2">
          <div class="w-[24px]">
            <i-ho-user-circle
              v-if="item.extras.icon === 'profile'"
              class="text-[19px]"
            />
            <i-ho-user-add
              v-if="item.extras.icon === 'user-add'"
              class="ml-[2px]"
            />
            <i-ho-refresh v-if="item.extras.icon === 'switch'" />
            <i-ho-mail v-if="item.extras.icon === 'mail'" />
            <i-ho-logout
              v-if="item.extras.icon === 'logout'"
              class="ml-[2px]"
            />
          </div>
          <div>
            {{ item.text }}
          </div>
        </div>
      </template>
    </BaseMenu>
  </div>

  <teleport v-if="!isSubscribed" to="#modal">
    <ModalEmailSubscription
      :open="modalEmailSubscriptionOpen"
      @close="modalEmailSubscriptionOpen = false"
    />
  </teleport>

  <teleport v-else to="#modal">
    <ModalEmailManagement
      :open="modalEmailSubscriptionOpen"
      @close="modalEmailSubscriptionOpen = false"
    />
  </teleport>
</template>
