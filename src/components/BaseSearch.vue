<script setup lang="ts">
const props = defineProps<{
  modelValue: string;
  placeholder?: string;
  modal?: boolean;
  focusOnMount?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const input = ref(props.modelValue || '');
const BaseInputEL = ref<HTMLDivElement | undefined>(undefined);

function handleInput(e) {
  input.value = e.target.value;
  emit('update:modelValue', e.target.value);
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
    :class="{ 'border-b bg-skin-bg px-4 py-3': modal }"
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
    <slot name="after" :clearInput="clearInput" />
    <i-ho-x
      v-if="!$slots.after && modelValue"
      class="cursor-pointer text-[18px]"
      @click="clearInput"
    />
  </div>
</template>
