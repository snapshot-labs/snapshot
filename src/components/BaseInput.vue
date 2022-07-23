<script lang="ts">
export default {
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

const props = withDefaults(
  defineProps<{
    type?: 'text' | 'number' | 'email';
    modelValue?: string | number;
    definition?: any;
    error?: { message: string; push?: boolean };
    focusOnMount?: boolean;
    hideInput?: boolean;
    placeholder?: string;
    title?: string;
    maxLength?: number;
    readonly?: boolean;
    information?: string;
  }>(),
  {
    type: 'text',
    modelValue: undefined,
    definition: undefined,
    error: () => ({ message: '', push: false }),
    focusOnMount: false,
    hideInput: false,
    placeholder: undefined,
    title: undefined,
    maxLength: undefined,
    readonly: false,
    information: undefined
  }
);

defineEmits(['update:modelValue']);

const BaseInputEL = ref<HTMLDivElement | undefined>(undefined);

const visited = ref(false);

const showErrorMessage = computed(() => visited.value || props.error.push);

onMounted(() => {
  if (props.focusOnMount) {
    BaseInputEL?.value?.focus();
  }
});
</script>

<template>
  <div class="w-full">
    <LabelInput v-if="title || definition?.title" :information="information">
      {{ title ?? definition.title }}
    </LabelInput>

    <div class="relative z-10">
      <div
        v-if="$slots.before"
        class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
      >
        <slot name="before" />
      </div>
      <input
        v-bind="$attrs"
        ref="BaseInputEL"
        :type="type"
        :value="modelValue"
        :class="[
          's-input !h-[42px]',
          { '!border-red': error.message && showErrorMessage }
        ]"
        :maxlength="maxLength ?? definition?.maxLength"
        :placeholder="placeholder ?? definition?.examples?.[0] ?? ''"
        :readonly="readonly"
        @blur="error.message ? (visited = true) : null"
        @focus="error.message ? null : (visited = false)"
        @input="
          $emit('update:modelValue', ($event.target as HTMLInputElement).value)
        "
      />
      <div
        v-if="$slots.after"
        class="absolute inset-y-0 right-0 flex items-center pr-4"
      >
        <slot name="after" />
      </div>
    </div>
    <div
      :class="[
        's-error',
        !!error.message && showErrorMessage
          ? '-mt-[21px] opacity-100'
          : '-mt-[38px] h-6 opacity-0'
      ]"
    >
      <BaseIcon
        v-if="error.message && showErrorMessage"
        name="warning"
        class="mr-2 text-white"
      />
      {{ error.message }}
    </div>
  </div>
</template>
