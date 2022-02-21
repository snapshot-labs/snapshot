<script setup lang="ts">
import options from '@/helpers/auth';
import { computed, ref } from 'vue';

type Option = { label: string; value: string; option?: Record<string, any> };

const props = defineProps<{
  options: Option[];
  title: string;
  modelValue?: string;
}>();

const displayDropdown = ref(false);

const inputValue = ref(
  props.options?.find(option => option.value === props.modelValue)?.label ?? ''
);

const displayedOptions = computed(() => {
  if (!props.options) return [];
  return props.options.filter(option =>
    option.label.toLowerCase().includes(inputValue.value.toLowerCase())
  );
});

const emit = defineEmits(['update:modelValue']);

function handleChange(option: Option) {
  inputValue.value = option.label;
  displayDropdown.value = false;
  emit('update:modelValue', option.value);
}
</script>

<template>
  <div class="relative">
    <SBase :definition="{ title: title }">
      <input
        type="text"
        v-model="inputValue"
        class="s-input"
        :placeholder="options[0]?.option?.label"
        @focus="
          {
            displayDropdown = true;
            inputValue = ''; // so that all the options show up
          }
        "
      />
    </SBase>
    <ul
      v-if="displayDropdown"
      class="z-10 max-h-[200px] mt-1 overflow-y-auto absolute w-full rounded-lg border border-skin-border bg-skin-bg"
    >
      <li
        class="hover:bg-skin-link hover:text-skin-bg p-2 bg-skin-bg"
        v-for="option in displayedOptions"
        :key="option.value"
        @click="() => handleChange(option)"
      >
        {{ option.label }}
      </li>
    </ul>
  </div>
</template>
