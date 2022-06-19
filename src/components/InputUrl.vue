<script setup lang="ts">
const props = defineProps<{
  modelValue?: string;
  placeholder?: string;
  title?: string;
  error?: { message: string; push: boolean };
  information?: string;
}>();

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div>
    <BaseInput
      v-bind="props"
      :model-value="modelValue as string"
      :error="error"
      :information="information"
      class="!pl-[40px]"
      @update:model-value="input => emit('update:modelValue', input)"
    >
      <template #before>
        <i-ho-globe-alt class="text-xs" />
      </template>
    </BaseInput>
  </div>
</template>
