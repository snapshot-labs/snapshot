<script setup lang="ts">
import { useDelegate } from '@/composables/useDelegate';
import { sleep } from '@snapshot-labs/snapshot.js/src/utils';

const props = defineProps<{
  open: boolean;
  userAddress: string;
  spaceId: string;
}>();

const emit = defineEmits(['close', 'reload']);

const { delegateTo, delegationLoading } = useDelegate();

async function handleDelegate() {
  emit('close');
  await delegateTo(props.userAddress, props.spaceId);
  await sleep(5000);
  emit('reload');
}
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <div class="flex flex-row items-center justify-center">
        <h3>{{ $t('profile.about.delegate') }}</h3>
      </div>
    </template>
    <div class="space-y-3 p-4">
      <BaseInput
        :model-value="userAddress"
        :title="$t('profile.about.delegateTo')"
        readonly
      >
        <template #label>{{ $t('delegate.to') }}</template>
      </BaseInput>
      <BaseInput :model-value="spaceId" :title="$t('space')" readonly>
        <template #label>{{ $t('space') }}</template>
      </BaseInput>
    </div>
    <div class="p-4">
      <BaseButton
        primary
        :loading="delegationLoading"
        class="w-full"
        @click="handleDelegate"
      >
        {{ $t('confirm') }}
      </BaseButton>
    </div>
  </BaseModal>
</template>
