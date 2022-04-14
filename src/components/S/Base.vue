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
  }>(),
  {
    type: 'text',
    focusOnMount: false,
    hideInput: false
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
    <label
      v-if="title || definition?.title"
      v-text="title ?? definition.title"
      class="s-label"
    />
    <div>
      <div class="z-10 relative">
        <slot v-if="$slots.customInput" name="customInput" />
        <input
          v-else
          ref="BaseInputEL"
          :type="type"
          :value="modelValue"
          @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
          :class="['s-input', { '!border-red': error }]"
          :maxlength="maxLength ?? definition?.maxLength"
          :placeholder="placeholder ?? definition?.examples?.[0] ?? ''"
        />
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
  </div>
</template>
