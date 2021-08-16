<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  modelValue: [String, Number],
  placeholder: String,
  error: [String, Boolean],
  number: Boolean,
  disabled: Boolean,
  required: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue']);

function handleInput(e) {
  const input = e.target.value;
  if (props.number) {
    return emit('update:modelValue', !input ? undefined : parseFloat(input));
  }
  emit('update:modelValue', input);
}
</script>

<template>
  <UiButton
    class="text-left mb-2 px-3 width-full d-flex"
    :class="{ 'border-red': error }"
  >
    <div class="text-color mr-2">
      <slot name="label" />
    </div>
    <div v-if="$slots.selected" class="flex-auto">
      <slot name="selected" />
    </div>
    <input
      v-else
      :value="modelValue"
      @input="handleInput"
      :placeholder="placeholder"
      :type="number ? 'number' : 'text'"
      :disabled="disabled"
      class="flex-auto input"
      :required="required"
    />
    <slot name="info" />
    <span
      v-if="error"
      :aria-label="error"
      class="float-right link-color tooltipped tooltipped-n"
    >
      <Icon name="warning" class="mt-1 text-red mr-n1 p-1 pt-2 d-block" />
    </span>
  </UiButton>
</template>
