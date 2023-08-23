<script setup lang="ts">
import { TreasuryWallet } from '@/helpers/interfaces';

defineProps<{
  treasuries: TreasuryWallet[];
  isViewOnly?: boolean;
}>();

const emit = defineEmits(['removeTreasury', 'editTreasury']);
</script>

<template>
   <SettingsTreasuriesBlockItemButton v-for="(treasury, i) in treasuries"
    :key="i"
    :treasury="treasury" :treasury-index="i" 
    :is-view-only="isViewOnly"
    @edit-treasury="i => emit('editTreasury', i)"
    @remove-treasury="i => emit('removeTreasury', i)"
   />
</template>
