<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { FormError } from '@/helpers/interfaces';
import { validateBytesString } from '@/helpers/transactionBuilder';

const props = defineProps<{
  bytesString: string;
  bytesType: string;
  label: string;
}>();

const emit = defineEmits<{
  (e: 'updateBytesString', bytesString: string): void;
  (e: 'updateError', error: FormError | null): void;
}>();

const input = ref<string>(props.bytesString);
const error = computed<FormError | null>(() =>
  validateBytesString(input.value, props.bytesType)
);

onMounted(() => (input.value = props.bytesString));

watch(input, () => emit('updateBytesString', input.value), { immediate: true });
watch(error, () => emit('updateError', error.value), { immediate: true });
</script>

<template>
  <div>
    <LabelInput>{{ label }}</LabelInput>
    <InputString
      v-model="input"
      placeholder="0x..."
      :error="error || undefined"
      @update:model-value="input = $event"
    />
  </div>
</template>
