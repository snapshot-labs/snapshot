<script setup lang="ts">
import { useWeb3 } from '@/composables/useWeb3';
import { useRouter } from 'vue-router';
import { useApp } from '@/composables/useApp';

const props = defineProps<{
  address: string;
}>();

const emit = defineEmits(['switchWallet']);

const { domain } = useApp();
const { logout } = useWeb3();
const router = useRouter();

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
</template>
