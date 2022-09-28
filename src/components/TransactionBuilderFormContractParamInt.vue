<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { FormError } from '@/helpers/interfaces';
import { validateIntString } from '@/helpers/transactionBuilder';

const props = withDefaults(
  defineProps<{
    intString: string;
    intType: string;
    label: string;
  }>(),
  {
    intString: ''
  }
);

const emit = defineEmits<{
  (e: 'updateIntString', intString: string): void;
}>();

const input = ref<string>(props.intString);
const error = computed<FormError | null>(() =>
  validateIntString(input.value, props.intType)
);

onMounted(() => (input.value = props.intString));

watch(input, () => emit('updateIntString', input.value), { immediate: true });
</script>

<template>
  <div>
    <LabelInput>{{ label }}</LabelInput>
    <InputString
      v-model="input"
      placeholder="e.g. max. 255 for uint8"
      :error="error || undefined"
      @update:model-value="input = $event"
    />
  </div>
</template>
