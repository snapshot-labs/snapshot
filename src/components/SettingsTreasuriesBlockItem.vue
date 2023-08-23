<script setup lang="ts">
import { TreasuryWallet } from '@/helpers/interfaces';

defineProps<{
  treasuries: TreasuryWallet[];
  isViewOnly?: boolean;
}>();

const emit = defineEmits(['editTreasury']);

</script>

<template>
  <div
    v-for="(treasury, i) in treasuries"
    :key="i"
    class="flex h-full truncate"
    @click="emit('editTreasury', i)"
  >
   <SettingsTreasuriesBlockItemButton :treasury="treasury" :treasury-index="i" :is-view-only="isViewOnly" />
  </div>
</template>
