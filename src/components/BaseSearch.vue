<script setup lang="ts">
import debounce from 'lodash/debounce';

const props = defineProps<{
  modelValue: string;
  placeholder?: string;
  modal?: boolean;
  focusOnMount?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const input = ref(props.modelValue || '');
const BaseInputEL = ref<HTMLDivElement | undefined>(undefined);

const debounceEmittedValue = debounce((value: string) => {
  emit('update:modelValue', value);
}, 500);

function handleInput(e) {
  input.value = e.target.value;
  if (props.modal) emit('update:modelValue', e.target.value);
  debounceEmittedValue(e.target.value);
}

function clearInput() {
  input.value = '';
  emit('update:modelValue', '');
}

onMounted(() => {
  if (props.focusOnMount) {
    BaseInputEL?.value?.focus();
  }
});

watch(
  () => props.modelValue,
  () => {
    input.value = props.modelValue;
  }
);
</script>

<template>
  <div
    class="flex items-center"
    :class="{ 'border-b bg-skin-bg py-3 pl-4': modal }"
  >
    <i-ho-search class="mr-2 text-[19px] text-skin-link" />
    <input
      ref="BaseInputEL"
      :value="input"
      :placeholder="placeholder"
      type="text"
      autocorrect="off"
      autocapitalize="none"
      class="input w-full flex-auto border-none"
      @input="handleInput"
    />
    <i-ho-x
      v-if="modelValue"
      class="mr-4 cursor-pointer text-[18px]"
      @click="clearInput"
    />
    <slot name="after" :clearInput="clearInput" />

    <slot name="after" :clearInput="clearInput" />
  </div>
</template>
