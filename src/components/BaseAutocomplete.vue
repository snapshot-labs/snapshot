<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';

type Option = { label: string; value: string; option?: Record<string, any> };

const props = defineProps<{
  title: string;
  options: Option[];
  modelValue?: string;
}>();

const optionsEl = ref<Node | undefined>(undefined);
const inputEl = ref<Node | undefined>(undefined);
const displayDropdown = ref(false);

const getOptionLabel = (value?: string) => {
  const option = props.options.find(option => option.value === value);
  return option ? option.label : '';
};

const searchInput = ref(getOptionLabel(props.modelValue));

const emit = defineEmits(['update:modelValue', 'changeSearchInput']);

function resetOptions() {
  // reset the options list
  emit('changeSearchInput', '');
}

function handleOptionSelect(e: MouseEvent, option: Option) {
  // The click should not bubble up to the rest of the DOM that causes click outside.
  e.stopPropagation();

  searchInput.value = option.label;
  displayDropdown.value = false;
  emit('update:modelValue', option.value);
  resetOptions();
}

/**
 * Open the options dropdown
 * Also set input value to blank so that user can type to search options
 */
function openOptions() {
  displayDropdown.value = true;
  searchInput.value = '';
}

/**
 * Close the options dropdown when clicking outside of it.
 * Also reset the input to previously selected value.
 */
function closeOptions(e) {
  const clickedOptions = optionsEl.value?.contains(e.target);
  const clickedInput = inputEl.value?.contains(e.target);
  const clickedOutside = !clickedOptions && !clickedInput;
  if (clickedOutside) {
    displayDropdown.value = false;
    searchInput.value = getOptionLabel(props.modelValue);
  }
  resetOptions();
}
window.addEventListener('click', closeOptions);
onBeforeUnmount(() => window.removeEventListener('click', closeOptions));

function handleChange(e) {
  searchInput.value = e.target.value;
  emit('changeSearchInput', e.target.value);
}
</script>

<template>
  <div class="relative">
    <SBase :definition="{ title: title }">
      <input
        ref="inputEl"
        type="text"
        :value="searchInput"
        @input="handleChange"
        class="s-input"
        :placeholder="$t('selectNetwork')"
        @focus="openOptions"
      />
    </SBase>
    <div
      ref="optionsEl"
      v-if="displayDropdown && options.length"
      class="py-2 border border-skin-link rounded-lg z-10 mt-2 absolute w-full bg-skin-bg"
    >
      <ul class="max-h-[170px] overflow-y-auto">
        <li
          class="hover:bg-skin-border hover:text-skin-link py-2 px-3 bg-skin-bg cursor-pointer"
          v-for="option in options"
          :key="option.value"
          @click="
            e => {
              handleOptionSelect(e, option);
            }
          "
        >
          <slot name="option" :option="option.option">
            {{ option.label }}
          </slot>
        </li>
      </ul>
    </div>
  </div>
</template>
