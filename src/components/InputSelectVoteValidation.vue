<script setup lang="ts">
import { ref } from 'vue';
import { VoteValidation } from '@/helpers/interfaces';

defineProps<{
  validation: VoteValidation;
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
    @click="isModalOpen = true"
  />

  <teleport to="#modal">
    <ModalVoteValidation
      :open="isModalOpen"
      :validation="validation"
      @close="isModalOpen = false"
      @add="emit('add', $event)"
    />
  </teleport>
</template>
