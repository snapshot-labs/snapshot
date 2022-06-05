<script lang="ts">
export default {
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import { ref, onMounted, watch, withDefaults } from 'vue';

const props = withDefaults(
  defineProps<{
    type?: 'text' | 'number';
    modelValue?: string;
    definition?: any;
    error?: string;
    focusOnMount?: boolean;
    hideInput?: boolean;
    placeholder?: string;
    title?: string;
    maxLength?: number;
    readonly?: boolean;
  }>(),
  {
    type: 'text',
    focusOnMount: false,
    hideInput: false,
    readonly: false
  }
);

defineEmits(['update:modelValue']);

const BaseInputEL = ref<HTMLDivElement | undefined>(undefined);
const showError = ref(false);

watch(
  () => props.modelValue,
  () => {
    showError.value = true;
  }
);

onMounted(() => {
  if (props.focusOnMount) {
    BaseInputEL?.value?.focus();
  }
});
</script>

<template>
  <div>
    <LabelInput v-if="title || definition?.title">
      {{ title ?? definition.title }}
    </LabelInput>

    <div class="z-10 relative">
      <div
        v-if="$slots.before"
        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
      >
        <slot name="before" />
      </div>
      <input
        v-bind="$attrs"
        ref="BaseInputEL"
        :type="type"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :class="['s-input', { '!border-red': error && showError }]"
        :maxlength="maxLength ?? definition?.maxLength"
        :placeholder="placeholder ?? definition?.examples?.[0] ?? ''"
        :readonly="readonly"
      />
      <div
        v-if="$slots.after"
        class="absolute inset-y-0 right-0 pr-4 flex items-center"
      >
        <slot name="after" />
      </div>
    </div>
    <div
      :class="[
        's-error',
        !!error && showError
          ? '-mt-[21px] opacity-100'
          : '-mt-[38px] opacity-0 h-6'
      ]"
    >
      <BaseIcon
        v-if="error && showError"
        name="warning"
        class="text-white mr-2"
      />
      {{ error }}
    </div>
  </div>
</template>
