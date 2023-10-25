<script setup lang="ts">
import { GnosisSafe } from '../../types';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';

defineProps<{
  open: boolean;
  safes: GnosisSafe[];
  selected: GnosisSafe | null;
}>();

const emit = defineEmits<{
  updateSafe: [type: GnosisSafe];
  close: [];
}>();

function select(type: GnosisSafe) {
  emit('updateSafe', type);
  emit('close');
}

function makeSafeDescription(safe: GnosisSafe) {
  const networkDetails = networks[safe.network];

  return `${safe.safeAddress} (${networkDetails?.name})`;
}
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <h3>Select Safe</h3>
    </template>
    <div class="mx-0 my-4 flex flex-col space-y-3 md:mx-4">
      <button v-for="(safe, key) in safes" :key="key" @click="select(safe)">
        <BaseModalSelectItem
          :selected="safe.safeAddress === selected?.safeAddress"
          :title="safe.safeName"
          :description="makeSafeDescription(safe)"
        />
      </button>
    </div>
  </BaseModal>
</template>
