<script setup lang="ts">
import { TreasuryWallet } from '@/helpers/interfaces';

defineProps<{
  treasuries: TreasuryWallet[];
  isViewOnly?: boolean;
  hasOsnapPlugin: boolean;
}>();

const emit = defineEmits<{
  removeTreasury: [index: number];
  editTreasury: [index: number];
  configureOsnap: [index: number, isEnabled: boolean];
}>();
</script>

<template>
  <SettingsTreasuriesBlockItemButton
    v-for="(treasury, i) in treasuries"
    :key="i"
    :treasury="treasury"
    :treasury-index="i"
    :is-view-only="!!isViewOnly"
    :has-osnap-plugin="hasOsnapPlugin"
    @edit-treasury="i => emit('editTreasury', i)"
    @remove-treasury="i => emit('removeTreasury', i)"
    @configure-osnap="(i, isEnabled) => emit('configureOsnap', i, isEnabled)"
  />
</template>
