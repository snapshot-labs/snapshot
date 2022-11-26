<script setup lang="ts">
import { ref } from 'vue';

withDefaults(
  defineProps<{
    type?: string;
    information?: string;
    allowAny?: boolean;
    disabled?: boolean;
  }>(),
  {
    type: '',
    information: '',
    allowAny: false,
    disabled: false
  }
);

const emit = defineEmits(['update:type']);

const modalVotingTypeOpen = ref(false);
</script>

<template>
  <InputSelect
    :title="$t(`settings.type.label`)"
    :information="information"
    :model-value="type ? $t(`voting.${type}`) : $t('settings.anyType')"
    :disabled="disabled"
    :tooltip="
      disabled
        ? $t('create.typeEnforced', { type: $t(`voting.${type}`) })
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
