<script setup lang="ts">
import { VoteValidation, ExtendedSpace } from '@/helpers/interfaces';

defineProps<{
  validation: VoteValidation;
  isDisabled?: boolean;
  space?: ExtendedSpace;
}>();

const emit = defineEmits(['add']);

const isModalOpen = ref(false);
</script>

<template>
  <InputSelect
    class="w-full"
    :title="$t(`votingValidation.label`)"
    :information="$t(`votingValidation.information`)"
    :model-value="$t(`votingValidation.${validation.name}.label`)"
    :is-disabled="isDisabled"
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
