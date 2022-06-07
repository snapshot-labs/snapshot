<script setup lang="ts">
import { ref, watch } from 'vue';
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
  ListboxLabel
} from '@headlessui/vue';

const props = defineProps<{
  items: { id: number; name: string }[];
  label?: string;
  placeholder?: string;
  modelValue?: { id: number; name: string }[];
  limit?: number;
}>();

const emit = defineEmits(['update:modelValue']);

const selectedItems = ref<{ id: number; name: string }[]>(
  props.modelValue ?? []
);

watch(selectedItems, () => emit('update:modelValue', selectedItems.value));

function isDisabled(item: { id: number; name: string }) {
  if (!props.limit) return false;
  if (selectedItems.value.length < props.limit) return false;
  return !selectedItems.value.some(selectedItem => selectedItem.id === item.id);
}
</script>

<template>
  <Listbox as="div" v-model="selectedItems" multiple>
    <ListboxLabel>
      <LabelInput>{{ label }}</LabelInput>
    </ListboxLabel>
    <div class="mt-1 relative">
      <ListboxButton
        class="relative w-full text-left pl-3 pr-[40px] border truncate border-skin-border text-skin-link h-[42px] rounded-full hover:border-skin-text"
      >
        <span v-if="selectedItems.length < 1" class="text-skin-text opacity-60">
          {{ placeholder }}
        </span>

        <slot
          v-else-if="$slots.selected"
          name="selected"
          :selectedItems="selectedItems"
        />

        <span v-else>
          {{ selectedItems.map(item => item.name).join(', ') }}
        </span>
        <span
          class="absolute inset-y-0 right-0 flex items-center pr-[12px] pointer-events-none"
        >
          <i-ho-chevron-down class="text-skin-text text-[14px]" />
        </span>
      </ListboxButton>
      <transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform -translate-y-2 scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-out"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <ListboxOptions
          class="absolute z-40 mt-1 w-full overflow-hidden bg-skin-bg shadow-lg rounded-md text-base border border-skin-border focus:outline-none sm:text-sm"
        >
          <div class="max-h-[180px] overflow-y-scroll">
            <ListboxOption
              as="template"
              v-for="item in items"
              :key="item.id"
              :value="item"
              :disabled="isDisabled(item)"
              v-slot="{ active, selected, disabled }"
            >
              <li
                :class="[
                  { 'bg-skin-border': active },
                  'cursor-default select-none relative py-2 pl-3 pr-9'
                ]"
              >
                <span
                  :class="[
                    selected ? 'font-semibold text-skin-link' : 'font-normal',
                    { 'text-skin-border': disabled },
                    'block truncate'
                  ]"
                >
                  <slot v-if="$slots.item" name="item" :item="item" />
                  <span v-else>
                    {{ item.name }}
                  </span>
                </span>

                <span
                  v-if="selected"
                  :class="['absolute inset-y-0 right-0 flex items-center pr-4']"
                >
                  <i-ho-check class="text-skin-text" />
                </span>
              </li>
            </ListboxOption>
          </div>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
</template>
