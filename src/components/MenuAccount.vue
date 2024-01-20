<script setup lang="ts">
import { openProfile } from '@/helpers/utils';

const props = defineProps<{
  address: string;
}>();

const emit = defineEmits(['switchWallet']);
const { domain } = useApp();
const { logout } = useWeb3();
const { modalEmailOpen } = useModal();
const router = useRouter();

function handleAction(e) {
  if (e === 'viewProfile') return openProfile(props.address, domain, router);
  if (e === 'switchWallet') return emit('switchWallet');
  if (e === 'subscribeEmail') {
    modalEmailOpen.value = true;
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
          text: 'Switch wallet',
          action: 'switchWallet',
          extras: { icon: 'switch' }
        },
        {
          text: 'Email notifications',
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

  <teleport to="#modal">
    <ModalEmail :open="modalEmailOpen" @close="modalEmailOpen = false" />
  </teleport>
</template>
