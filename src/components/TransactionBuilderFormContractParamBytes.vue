<script setup lang="ts">
import { computed, ref } from 'vue';
import { isHexString } from '@ethersproject/bytes';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    exactBytesType: string;
    label: string;
  }>(),
  {
    modelValue: '0x'
  }
);

defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const input = ref<string>(props.modelValue);

const requiredBytesLength = computed(() =>
  Number(props.exactBytesType.replace('bytes', ''))
);
const requiredBytesStringLength = computed(() => requiredBytesLength.value * 2);

const bytesFormatError = computed<{ message: string } | undefined>(() => {
  if (!input.value.startsWith('0x'))
    return { message: 'Bytes must start with 0x', push: true };
  if (!isHexString(input.value))
    return { message: 'Bytes must be a valid hex string', push: true };

  const bytesStringWithout0x = input.value.slice(2);

  if (requiredBytesStringLength.value === 0) {
    if (bytesStringWithout0x.length % 2 !== 0) {
      return { message: 'Bytes string must be even length', push: true };
    }

    return undefined;
  }

  if (bytesStringWithout0x.length !== requiredBytesStringLength.value)
    return {
      message: `Requires exactly ${requiredBytesLength.value} bytes`,
      push: true
    };

  return undefined;
});
</script>

<template>
  <LabelInput>{{ label }}</LabelInput>
  <InputString
    v-model="input"
    placeholder="0x..."
    :error="bytesFormatError"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>
