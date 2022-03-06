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
  <div class="min-h-[48px] rounded-3xl overflow-hidden w-full">
    <div
      class="border border-skin-border transition-colors rounded-3xl outline-none leading-[46px] text-left w-full flex px-3 focus-within:border-skin-link hover:border-skin-link bg-skin-bg relative z-10"
      :class="{ '!border-red': !!error }"
    >
      <div class="text-skin-text mr-2 whitespace-nowrap">
        <slot name="label" />
      </div>
      <div
        v-if="$slots.selected"
        class="flex-auto whitespace-nowrap overflow-x-auto text-skin-link"
        :class="{ 'cursor-not-allowed text-skin-border': disabled }"
      >
        <slot name="selected" />
      </div>
      <input
        v-else
        :value="modelValue"
        @input="handleInput"
        ref="inputRef"
        :placeholder="placeholder"
        :type="number ? 'number' : 'text'"
        :disabled="disabled"
        class="input flex-auto w-full"
        :class="[additionalInputClass, { 'cursor-not-allowed': disabled }]"
        :required="required"
        :maxlength="maxlength"
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
      <Icon name="warning" class="text-red-500 mr-2" />
      {{ error || '' }}
      <!-- The fact that error can be bool or string makes this necessary -->
    </div>
  </div>
</template>
