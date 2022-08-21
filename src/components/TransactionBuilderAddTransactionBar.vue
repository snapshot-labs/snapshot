<script setup lang="ts">
import { TransactionType } from '@/helpers/transactionBuilder';

defineEmits<{
  (e: 'selectType', type: TransactionType): void;
}>();
</script>

<template>
  <div class="flex items-center justify-evenly">
    <div
      class="flex h-[64px] grow cursor-pointer flex-col items-center justify-center hover:bg-skin-border"
      @click="$emit('selectType', TransactionType.TRANSFER_FUNDS)"
    >
      <i-ho-database class="inline" /><br />
      Funds
    </div>
    <div
      class="flex h-[64px] grow cursor-pointer flex-col items-center justify-center hover:bg-skin-border"
      @click="$emit('selectType', TransactionType.TRANSFER_NFT)"
    >
      <i-ho-photograph />
      NFT
    </div>
    <div
      class="flex h-[64px] grow cursor-pointer flex-col items-center justify-center hover:bg-skin-border"
      @click="$emit('selectType', TransactionType.CONTRACT_INTERACTION)"
    >
      <i-s-smart-contract />
      Contract
    </div>
    <div
      class="flex h-[64px] grow cursor-pointer flex-col items-center justify-center hover:bg-skin-border"
      @click="$emit('selectType', TransactionType.RAW_TRANSACTION)"
    >
      <i-ho-adjustments />
      Raw
    </div>
  </div>
</template>
