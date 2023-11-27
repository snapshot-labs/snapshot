<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: number;
    definition: any;
    error?: string;
    type?: 'number';
  }>(),
  {
    error: '',
    type: 'number'
  }
);

const emit = defineEmits(['update:modelValue']);

const numberInputRef = ref();

function forceShowError() {
  numberInputRef?.value?.forceShowError();
}

defineExpose({
  forceShowError
});
</script>

<template>
  <TuneInput
    ref="numberInputRef"
    v-bind="props"
    @update:model-value="emit('update:modelValue', Number($event))"
  />
</template>
