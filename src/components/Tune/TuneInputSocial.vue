<script setup lang="ts">
defineProps<{
  modelValue?: string;
  error?: string;
  placeholder?: string;
  maxLength?: number;
  label?: string;
  disabled?: boolean;
  icon?: 'x' | 'github' | 'earth' | 'coingecko';
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
    :placeholder="placeholder"
    :max-length="maxLength"
    :disabled="disabled"
    class="!pl-[40px]"
    @update:model-value="(value: string) => emit('update:modelValue', value)"
  >
    <template #before>
      <i-s-x v-if="icon === 'x'" class="text-[16px]" />
      <i-s-github v-if="icon === 'github'" class="text-[16px]" />
      <i-ho-globe-alt v-if="icon === 'earth'" class="text-[16px]" />
      <i-s-coingecko v-if="icon === 'coingecko'" class="text-[16px]" />
    </template>
  </TuneInput>
</template>
