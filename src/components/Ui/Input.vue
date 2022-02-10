<script setup>
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
</script>

<template>
  <div class="min-h-[48px] rounded-3xl overflow-hidden">
    <div
      class="border border-skin-border transition-colors rounded-3xl outline-none leading-[46px] text-left w-full flex px-3 focus-within:border-skin-link hover:border-skin-link bg-white relative z-10"
    >
      <div class="text-color mr-2 whitespace-nowrap">
        <slot name="label" />
      </div>
      <div
        v-if="$slots.selected"
        class="flex-auto whitespace-nowrap overflow-x-auto"
      >
        <slot name="selected" />
      </div>
      <input
        v-else
        :value="modelValue"
        @input="handleInput"
        :placeholder="placeholder"
        :type="number ? 'number' : 'text'"
        :disabled="disabled"
        class="input flex-auto w-full"
        :class="additionalInputClass"
        :required="required"
        :maxlength="maxlength"
        @blur="emit('blur')"
      />
      <slot name="info" />
    </div>
    <div
      :class="[
        'bg-pink-100 text-rose-500 text-sm relative z-0 transition-all flex items-center px-3 pb-2 pt-4 rounded-b-3xl',
        !!error ? '-mt-[20px] opacity-100' : '-mt-[48px] opacity-0'
      ]"
    >
      <Icon name="warning" class="text-red-500 mr-2" />
      {{ error || '' }}
      <!-- The fact that error can be bool or string makes this necessary -->
    </div>
  </div>
</template>
