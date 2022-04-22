<script setup lang="ts">
import { useWeb3 } from '@/composables/useWeb3';
import { useRouter } from 'vue-router';

const props = defineProps<{
  address: string;
}>();

const emit = defineEmits(['switchWallet']);

const { logout } = useWeb3();
const router = useRouter();

function handleAction(e) {
  if (e === 'viewProfile')
    return router.push({
      name: 'profileAbout',
      params: { address: props.address }
    });
  if (e === 'switchWallet') return emit('switchWallet');
  return logout();
}
</script>

<template>
  <div>
    <BaseDropdown
      :items="[
        { text: 'View profile', action: 'viewProfile', icon: 'profile' },
        { text: 'Switch wallet', action: 'switchWallet', icon: 'switch' },
        { text: 'Log out', action: 'logout', icon: 'logout' }
      ]"
      @select="handleAction($event)"
    >
      <template v-slot:button>
        <slot />
      </template>
      <template v-slot:item="{ item }">
        <div class="flex items-center space-x-2">
          <i-ho-user-circle v-if="item.icon === 'profile'" />
          <i-ho-refresh v-if="item.icon === 'switch'" />
          <i-ho-logout v-if="item.icon === 'logout'" />
          <div>
            {{ item.text }}
          </div>
        </div>
      </template>
    </BaseDropdown>
  </div>
</template>
