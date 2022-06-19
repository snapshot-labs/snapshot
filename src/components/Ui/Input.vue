<script setup>
import { onMounted, ref } from 'vue';

const props = defineProps({
  modelValue: [String, Number],
  placeholder: String,
  error: [String, Boolean],
  number: Boolean,
  disabled: Boolean,
  maxlength: [Number, String],
  additionalInputClass: String,
  required: {
    type: Boolean,
    default: true
  },
  focusOnMount: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'blur']);

function handleInput(e) {
  const input = e.target.value;
  if (props.number) {
    return emit('update:modelValue', !input ? undefined : parseFloat(input));
  }
  emit('update:modelValue', input);
}

const inputRef = ref(null);

onMounted(() => {
  if (props.focusOnMount) {
    inputRef?.value?.focus();
  }
});
</script>

<template>
  <div class="w-full rounded-3xl">
    <div
      class="relative z-10 flex w-full rounded-3xl border border-skin-border bg-skin-bg px-3 text-left leading-[42px] outline-none transition-colors focus-within:border-skin-text"
      :class="{ '!border-red': !!error }"
    >
      <div class="mr-2 whitespace-nowrap text-skin-text">
        <slot name="label" />
      </div>
      <button
        v-if="$slots.selected"
        class="flex-auto overflow-x-auto whitespace-nowrap text-left text-skin-link outline-none"
        :class="{ 'cursor-not-allowed text-skin-border': disabled }"
      >
        <slot name="selected" />
      </button>
      <input
        v-else
        ref="inputRef"
        :value="modelValue"
        :placeholder="placeholder"
        :type="number ? 'number' : 'text'"
        :disabled="disabled"
        class="input w-full flex-auto"
        :class="[additionalInputClass, { 'cursor-not-allowed': disabled }]"
        :required="required"
        :readonly="readonly"
        :maxlength="maxlength"
        @input="handleInput"
        @blur="emit('blur')"
      />
      <slot name="info" />
    </div>
    <div
      :class="[
        's-error relative z-0',
        !!error ? '-mt-[20px] opacity-100' : '-mt-[48px] opacity-0'
      ]"
    >
      <BaseIcon name="warning" class="text-red-500 mr-2" />
      {{ error || '' }}
      <!-- The fact that error can be bool or string makes this necessary -->
    </div>
  </div>
</template>
