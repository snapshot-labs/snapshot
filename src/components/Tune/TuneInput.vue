<script lang="ts">
export default {
  inheritAttrs: false
};
</script>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label?: string;
    hint?: string;
    loading?: boolean;
    error?: string;
    block?: boolean;
    type?: 'text' | 'number';
    modelValue?: string | number;
    autofocus?: boolean;
    placeholder?: string;
    maxLength?: number;
    readonly?: boolean;
    disabled?: boolean;
    definition?: any;
    alwaysShowError?: boolean;
  }>(),
  {
    label: '',
    hint: '',
    loading: false,
    error: '',
    block: true,
    type: 'text',
    modelValue: '',
    autofocus: false,
    placeholder: '',
    maxLength: undefined,
    readonly: false,
    disabled: false,
    definition: {},
    alwaysShowError: false
  }
);

defineEmits(['update:modelValue']);

const inputRef = ref();

const forceError = ref(false);
const showError = ref(false);

const showErrorMessage = computed(() => {
  return forceError.value || props.alwaysShowError || showError.value;
});

function forceShowError() {
  forceError.value = true;
}

defineExpose({
  forceShowError
});

onMounted(() => {
  if (props.autofocus) {
    inputRef?.value?.focus();
  }
});
</script>

<template>
  <div :class="{ 'w-full': block }">
    <TuneLabelInput
      v-if="label || definition?.title"
      :hint="hint || definition?.description"
    >
      {{ label || definition.title }}
    </TuneLabelInput>
    <div class="flex">
      <div :class="['group relative z-10 flex', { 'w-full': block }]">
        <div
          v-if="$slots.before"
          class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
        >
          <slot name="before" />
        </div>
        <input
          v-bind="$attrs"
          ref="inputRef"
          :type="type"
          :value="modelValue"
          :class="[
            'tune-input px-3 py-2',
            { 'tune-error-border': error && showErrorMessage },
            { 'cursor-not-allowed': disabled },
            { 'w-full': block }
          ]"
          :placeholder="placeholder || definition?.examples?.[0] || ''"
          :readonly="readonly"
          :disabled="disabled"
          :maxlength="maxLength || definition?.maxLength"
          @blur="error ? (showError = true) : null"
          @focus="error ? null : (showError = false)"
          @input="
            $emit(
              'update:modelValue',
              ($event.target as HTMLInputElement).value
            )
          "
        />
        <div
          v-if="loading"
          class="tune-input-loading absolute inset-y-0 right-0 top-[1px] mr-1 flex h-[40px] items-center overflow-hidden pl-2 pr-2"
        >
          <TuneLoadingSpinner v-if="loading" />
        </div>
        <div
          v-else-if="$slots.after"
          class="absolute inset-y-0 right-0 flex items-center pr-4"
        >
          <slot name="after" />
        </div>
      </div>
    </div>
    <TuneErrorInput v-if="error && showErrorMessage" :error="error" />
  </div>
</template>
