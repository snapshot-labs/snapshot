<script setup lang="ts">
import { computed } from 'vue';
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
  disableInput?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const selectedItems = computed({
  get: () => props.modelValue ?? [],
  set: newVal => emit('update:modelValue', newVal)
});

function isDisabled(item: { id: number; name: string }) {
  if (!props.limit) return false;
  if (selectedItems.value.length < props.limit) return false;
  return !selectedItems.value.some(selectedItem => selectedItem.id === item.id);
}
</script>

<template>
  <Listbox v-model="selectedItems" as="div" :disabled="disableInput" multiple>
    <ListboxLabel>
      <LabelInput>{{ label }}</LabelInput>
    </ListboxLabel>
    <div class="relative">
      <ListboxButton
        class="relative h-[42px] w-full truncate rounded-full border border-skin-border pl-3 pr-[40px] text-left text-skin-link hover:border-skin-text"
        :class="{ 'cursor-not-allowed text-skin-border': disableInput }"
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
          class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-[12px]"
        >
          <i-ho-chevron-down class="text-[14px] text-skin-text" />
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
          class="absolute z-40 mt-1 w-full overflow-hidden rounded-md border border-skin-border bg-skin-bg text-base shadow-lg focus:outline-none sm:text-sm"
        >
          <div class="max-h-[180px] overflow-y-scroll">
            <ListboxOption
              v-for="item in items"
              :key="item.id"
              v-slot="{ active, selected, disabled }"
              as="template"
              :value="item"
              :disabled="isDisabled(item)"
            >
              <li
                :class="[
                  { 'bg-skin-border': active },
                  'relative cursor-default select-none py-2 pr-[50px] pl-3'
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
                  :class="['absolute inset-y-0 right-0 flex items-center pr-3']"
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
