<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  modelValue: [String, Number],
  placeholder: String,
  error: String,
  number: Boolean,
  disabled: Boolean
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
    class="text-left width-full mb-2 d-flex px-3"
    :class="{ 'border-red': error }"
  >
    <div class="text-gray mr-2">
      <slot name="label" />
    </div>
    <div v-if="$slots.selected" class="flex-auto"><slot name="selected" /></div>
    <input
      v-else
      :value="modelValue"
      @input="handleInput"
      :placeholder="placeholder"
      :type="number ? 'number' : 'text'"
      :disabled="disabled"
      class="input flex-auto"
      required
    />
    <slot name="info" />
    <span
      v-if="error"
      :aria-label="error"
      class="float-right text-white tooltipped tooltipped-n"
      ><Icon name="warning" class="text-red p-1 d-block pt-2 mt-1 mr-n1"
    /></span>
  </UiButton>
</template>
