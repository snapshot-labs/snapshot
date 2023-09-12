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
    class="flex h-[44px] items-center"
    :class="{ 'border-b bg-skin-bg py-3 pl-4': modal }"
  >
    <i-ho-search class="mr-2 flex-shrink-0 text-[19px] text-skin-link" />
    <input
      ref="BaseInputEL"
      :value="input"
      :placeholder="placeholder"
      type="text"
      autocorrect="off"
      autocapitalize="none"
      class="input w-full border-none"
      @input="handleInput"
    />
    <i-ho-x-circle
      v-if="modelValue"
      class="mr-[6px] flex-shrink-0 cursor-pointer text-[16px] text-skin-link"
      @click="clearInput"
    />
    <slot name="after" class="flex-shrink-0" />
  </div>
</template>
