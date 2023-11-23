<script setup lang="ts">
defineProps<{
  modelValue?: string;
  placeholder?: string;
  label?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  maxLength?: number;
}>();

const emit = defineEmits(['update:modelValue']);

const inputRef = ref();

function forceShowError() {
  inputRef?.value?.forceShowError();
}

defineExpose({
  forceShowError
});
</script>

<template>
  <TuneInput
    ref="inputRef"
    :label="label"
    :model-value="modelValue"
    :error="error"
    :hint="hint"
    :disabled="disabled"
    :placeholder="placeholder"
    :max-length="maxLength"
    class="!pl-[40px]"
    @update:model-value="input => emit('update:modelValue', input)"
  >
    <template #before>
      <i-ho-globe-alt class="text-sm" />
    </template>
  </TuneInput>
</template>
