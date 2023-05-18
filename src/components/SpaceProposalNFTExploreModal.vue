<script setup lang="ts">
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  open: boolean;
}>();

defineEmits(['close']);

// watch(
//   () => props.open,
//   val => {
//   }
// );

async function explore() {
  // goto opensea?
}
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <div
        class="flex flex-col content-center items-center justify-center gap-x-4"
      >
        <h3>Explore nfts</h3>
      </div>
    </template>
    <template #default="{ maxHeight }">
      <div
        class="flex flex-row justify-center p-4"
        :style="{ minHeight: maxHeight }"
      >
        <span>All proposal NFTs here...</span>
      </div>
    </template>
  </BaseModal>
</template>
