<script setup lang="ts">
import { VoteValidation, ExtendedSpace } from '@/helpers/interfaces';

defineProps<{
  validation: VoteValidation;
  disabled?: boolean;
  space?: ExtendedSpace;
}>();

const emit = defineEmits(['add']);

const isModalOpen = ref(false);
</script>

<template>
  <TuneButtonSelect
    class="w-full"
    :label="$t(`votingValidation.label`)"
    :hint="$t(`votingValidation.information`)"
    :model-value="$t(`votingValidation.${validation.name}.label`)"
    :disabled="disabled"
    @select="isModalOpen = true"
  />

  <teleport to="#modal">
    <ModalVoteValidation
      :open="isModalOpen"
      :validation="validation"
      :space="space"
      @close="isModalOpen = false"
      @add="emit('add', $event)"
    />
  </teleport>
</template>
