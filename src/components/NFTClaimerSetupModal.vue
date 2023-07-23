<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';

defineProps<{
  space: ExtendedSpace;
  open: boolean;
}>();

defineEmits(['close']);
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <h3>{{ $t('Setup SnapIt!') }}</h3>
    </template>
    <template #default>
      <form class="flex flex-col gap-y-3 p-3">
        <NFTClaimerSetupForm :space="space" />
        <BaseButton primary class="w-full" type="submit">
          Setup SnapIt!
        </BaseButton>
      </form>
    </template>
  </BaseModal>
</template>
