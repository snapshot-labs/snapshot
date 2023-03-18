<script setup lang="ts">
import { ref } from 'vue';

withDefaults(
  defineProps<{
    type?: string;
    information?: string;
    allowAny?: boolean;
    isDisabled?: boolean;
    isDisabledSettings?: boolean;
  }>(),
  {
    type: '',
    information: '',
    allowAny: false,
    isDisabled: false,
    isDisabledSettings: false
  }
);

const emit = defineEmits(['update:type']);

const modalVotingTypeOpen = ref(false);
</script>

<template>
  <InputSelect
    :title="$t(`settings.type.label`)"
    :information="information"
    :model-value="type ? $t(`voting.${type}.label`) : $t('settings.anyType')"
    :disabled="isDisabled || isDisabledSettings"
    :tooltip="
      isDisabled
        ? $t('create.typeEnforced', { type: $t(`voting.${type}.label`) })
        : null
    "
    @select="modalVotingTypeOpen = true"
  />
  <teleport to="#modal">
    <ModalVotingType
      :selected="type"
      :open="modalVotingTypeOpen"
      :allow-any="allowAny"
      @update:selected="emit('update:type', $event)"
      @close="modalVotingTypeOpen = false"
    />
  </teleport>
</template>
