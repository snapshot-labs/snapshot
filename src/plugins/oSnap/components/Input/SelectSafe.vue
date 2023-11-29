<script setup lang="ts">
import { GnosisSafe } from '../../types';
import ModalSafe from '../TransactionBuilder/ModalSafe.vue';

defineProps<{
  safes: GnosisSafe[];
  selectedSafe: GnosisSafe | null;
}>();

const emit = defineEmits<{
  updateSafe: [safe: GnosisSafe];
}>();

const isModalOpen = ref(false);
</script>

<template>
  <div class="mb-2">
    <TuneButtonSelect
      :model-value="
        safes.find(safe => safe.safeAddress === selectedSafe?.safeAddress)
          ?.safeName || 'Select Safe'
      "
      @select="isModalOpen = true"
    />
    <teleport to="#modal">
      <ModalSafe
        :selected="selectedSafe"
        :open="isModalOpen"
        :safes="safes"
        @update-safe="emit('updateSafe', $event)"
        @close="isModalOpen = false"
      />
    </teleport>
  </div>
</template>
