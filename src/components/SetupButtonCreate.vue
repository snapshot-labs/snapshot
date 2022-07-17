<script setup lang="ts">
import { useWeb3 } from '@/composables/useWeb3';
import { useSpaceController } from '@/composables/useSpaceController';
const { pendingENSRecord, uriAddress } = useSpaceController();

const { web3Account } = useWeb3();

const emit = defineEmits(['create']);

defineProps<{
  creatingSpace: boolean;
}>();
</script>

<template>
  <BaseButton
    class="float-right"
    primary
    :disabled="uriAddress !== web3Account && !pendingENSRecord"
    :loading="creatingSpace"
    @click="emit('create')"
  >
    {{ $t('createButton') }}
  </BaseButton>
</template>
