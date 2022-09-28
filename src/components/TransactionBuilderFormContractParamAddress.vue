<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { FormError } from '@/helpers/interfaces';
import { validateAddress } from '@/helpers/transactionBuilder';

const props = withDefaults(
  defineProps<{
    address: string;
    label: string;
  }>(),
  {
    address: ''
  }
);

const emit = defineEmits<{
  (e: 'updateAddress', address: string): void;
}>();

const input = ref<string>(props.address);
const error = computed<FormError | null>(() => validateAddress(input.value));

onMounted(() => (input.value = props.address));

watch(input, () => emit('updateAddress', input.value), { immediate: true });
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
