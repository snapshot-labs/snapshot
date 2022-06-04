<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from 'vue';

type Option = { label: string; value: string; option?: Record<string, any> };

const props = defineProps<{
  label: string;
  options: Option[];
  value?: string;
  search?: string;
  placeholder?: string;
}>();

const optionsEl = ref<HTMLDivElement | undefined>(undefined);
const inputEl = ref<HTMLInputElement | undefined>(undefined);
const selectedInputEl = ref<HTMLDivElement | undefined>(undefined);
const displayDropdown = ref(false);

const getOption = (value?: string) => {
  const option = props.options.find(option => option.value === value);
  return option;
};

const searchInput = ref(getOption(props.value)?.label || '');

const emit = defineEmits(['update:value', 'update:search']);

function resetOptions() {
  // reset the options list
  emit('update:search', '');
}

function handleOptionSelect(e: MouseEvent, option: Option) {
  // The click should not bubble up to the rest of the DOM that causes click outside.
  e.stopPropagation();

  searchInput.value = option.label;
  displayDropdown.value = false;
  emit('update:value', option.value);
  resetOptions();
}

/**
 * Open the options dropdown
 * Also set input value to blank so that user can type to search options
 */
function openOptions() {
  displayDropdown.value = true;
  searchInput.value = '';
  // needed to focus the input correctly. https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Client-side_JavaScript_frameworks/Vue_refs_focus_management#vues_nexttick_method
  nextTick(() => {
    inputEl.value?.focus();
  });
}

/**
 * Close the options dropdown when clicking outside of it.
 * Also reset the input to previously selected value.
 */
function closeOptions(e) {
  const clickedOptions = optionsEl.value?.contains(e.target);
  const clickedSelectedInput = selectedInputEl.value?.contains(e.target);
  const clickedInput = inputEl.value === e.target;
  const clickedOutside =
    !clickedOptions && !clickedInput && !clickedSelectedInput;

  if (clickedOutside) {
    displayDropdown.value = false;
    searchInput.value = getOption(props.value)?.label || '';
    resetOptions();
  }
}
window.addEventListener('click', closeOptions);
onBeforeUnmount(() => window.removeEventListener('click', closeOptions));

function handleChange(e) {
  searchInput.value = e.target.value;
  emit('update:search', e.target.value);
}
</script>

<template>
  <div class="relative">
    <LabelInput>
      {{ label }}
    </LabelInput>
    <div class="relative z-30">
      <input
        v-show="displayDropdown"
        ref="inputEl"
        type="text"
        :value="searchInput"
        @input="handleChange"
        class="s-input !bg-skin-bg"
        :placeholder="placeholder ?? $t('select')"
      />
      <!-- Fake Input to display the selected value -->
      <div
        ref="selectedInputEl"
        @click="openOptions"
        v-show="!displayDropdown"
        class="s-input !bg-skin-bg"
      >
        <slot name="option" :option="getOption(value)?.option">
          {{ getOption(value)?.label ?? '' }}
        </slot>
      </div>
    </div>

    <div
      ref="optionsEl"
      class="border border-skin-link rounded-b-lg z-20 mt-2 absolute w-full bg-skin-bg transition-all pt-[19px] overflow-hidden shadow-lg"
      :class="
        displayDropdown && options.length
          ? '-mt-[19px] opacity-100'
          : '-mt-[48px] opacity-0 pointer-events-none'
      "
    >
      <ul class="max-h-[200px] overflow-y-auto">
        <li
          class="hover:bg-skin-border hover:text-skin-link py-2 px-3 bg-skin-bg cursor-pointer"
          v-for="option in options"
          :key="option.value"
          @click.stop="handleOptionSelect($event, option)"
        >
          <slot name="option" :option="option.option">
            {{ option.label }}
          </slot>
        </li>
      </ul>
    </div>
  </div>
</template>
