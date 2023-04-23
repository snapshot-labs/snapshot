<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: string;
    hint?: string;
    allowAny?: boolean;
    disabled?: boolean;
    isDisabledSettings?: boolean;
  }>(),
  {
    type: '',
    hint: '',
    allowAny: false,
    disabled: false,
    isDisabledSettings: false
  }
);

const emit = defineEmits(['update:type']);

const modalVotingTypeOpen = ref(false);
</script>

<template>
  <TuneButtonSelect
    :label="$t(`settings.type.label`)"
    :hint="hint"
    :model-value="type ? $t(`voting.${type}.label`) : $t('settings.anyType')"
    :disabled="disabled || isDisabledSettings"
    :tooltip="
      disabled
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
