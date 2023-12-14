<script lang="ts">
export default {
  inheritAttrs: false
};
</script>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: string;
    definition?: any;
    label?: string;
    hint?: string;
    placeholder?: string;
    error?: string;
    autosize?: boolean;
    disabled?: boolean;
    maxLength?: number;
  }>(),
  {
    label: '',
    hint: '',
    placeholder: '',
    error: '',
    autosize: true,
    disabled: false,
    maxLength: undefined,
    definition: undefined
  }
);

const emit = defineEmits(['update:modelValue']);

const input = computed({
  get: () => props.modelValue || props.definition?.default || '',
  set: value => emit('update:modelValue', value)
});

const textareaRef = ref();
const showErrorMessage = ref(false);
const inputHeight = ref('auto');

const autoResizeStyles = computed(() => {
  if (!props.autosize) return '';
  return `resize: none; height: ${inputHeight.value};`;
});

function forceShowError() {
  showErrorMessage.value = true;
}

function adjustHeight() {
  inputHeight.value = 'auto';
  nextTick(() => {
    if (!textareaRef.value) return;
    let contentHeight = textareaRef.value.scrollHeight + 1;
    inputHeight.value = `${contentHeight}px`;
  });
}

defineExpose({
  forceShowError
});

watch(input, value => {
  nextTick(adjustHeight);
  if (value) adjustHeight();
});

onMounted(() => adjustHeight());
</script>

<template>
  <div>
    <TuneLabelInput :hint="hint || definition?.description">
      {{ label || definition?.title }}
    </TuneLabelInput>
    <textarea
      v-bind="$attrs"
      ref="textareaRef"
      v-model="input"
      :class="[
        'tune-textarea w-full',
        {
          'tune-error-border': !!error && showErrorMessage
        },
        { disabled: disabled }
      ]"
      :style="autoResizeStyles"
      :placeholder="placeholder || definition?.examples?.[0]"
      :disabled="disabled"
      :maxlength="maxLength || definition?.maxLength"
      @blur="error ? (showErrorMessage = true) : null"
      @focus="error ? null : (showErrorMessage = false)"
    />
    <TuneErrorInput
      v-if="error && showErrorMessage"
      class="!-mt-1"
      :error="error"
    />
  </div>
</template>
