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
        { text: 'View profile', action: 'viewProfile' },
        { text: 'Switch wallet', action: 'switchWallet' },
        { text: 'Log out', action: 'logout' }
      ]"
      @select="handleAction($event)"
    >
      <template v-slot:button>
        <slot />
      </template>
    </BaseDropdown>
  </div>
</template>
