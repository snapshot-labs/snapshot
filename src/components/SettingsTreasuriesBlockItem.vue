<script setup lang="ts">
import { TreasuryWallet } from '@/helpers/interfaces';

defineProps<{
  treasuries: TreasuryWallet[];
}>();

const emit = defineEmits(['removeTreasury', 'editTreasury']);
</script>

<template>
  <div
    v-for="(treasury, i) in treasuries"
    :key="i"
    class="flex h-full truncate"
    @click="emit('editTreasury', i)"
  >
    <button
      class="flex w-full items-center justify-between rounded-md border p-4"
    >
      <div class="flex items-center gap-2 truncate pr-[20px] text-left">
        <h4 class="truncate">{{ treasury.name }}</h4>
      </div>
      <BaseButtonIcon class="-mr-2" @click.stop="emit('removeTreasury', i)">
        <BaseIcon name="close" size="14" />
      </BaseButtonIcon>
    </button>
  </div>
</template>
