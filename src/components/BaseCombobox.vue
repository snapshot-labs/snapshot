<script setup lang="ts">
import { ref, watch } from 'vue';
import {
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
  ComboboxLabel,
  ComboboxButton
} from '@headlessui/vue';

const props = defineProps<{
  label: string;
  items: { id: number | string; name: string }[];
  selectedId?: number | string;
}>();

const emit = defineEmits(['select', 'search']);

const selectedItem = ref<{ id: number | string; name: string }>(props.items[0]);

watch(selectedItem, () => emit('select', selectedItem.value));

watch(
  () => props.selectedId,
  () => {
    const selected = props.items.find(item => item.id === props.selectedId);
    selectedItem.value = selected ? selected : props.items[0];
  },
  { immediate: true }
);
</script>

<template>
  <Combobox v-model="selectedItem" as="div" class="w-full">
    <ComboboxLabel class="block">
      <LabelInput>{{ label }}</LabelInput>
    </ComboboxLabel>
    <div class="relative">
      <ComboboxButton class="w-full">
        <ComboboxInput
          class="s-input w-full py-2 pl-3 !pr-[30px] focus:outline-none"
          spellcheck="false"
          :display-value="(item: any) => item.name"
          @change="emit('search', $event.target.value)"
        />
      </ComboboxButton>
      <ComboboxButton
        class="absolute inset-y-0 right-0 flex items-center px-2 focus:outline-none"
      >
        <i-ho-chevron-down class="text-[14px] text-skin-text" />
      </ComboboxButton>
      <ComboboxOptions
        v-if="items.length > 0"
        class="absolute z-40 mt-1 w-full overflow-hidden rounded-md border border-skin-border bg-skin-bg text-base shadow-lg focus:outline-none sm:text-sm"
      >
        <div class="max-h-[180px] overflow-y-scroll">
          <ComboboxOption
            v-for="item in items"
            v-slot="{ active, selected, disabled }"
            :key="item.id"
            as="template"
            :value="item"
          >
            <li
              :class="[
                { 'bg-skin-border': active },
                'relative cursor-default select-none truncate py-2 pr-[50px] pl-3'
              ]"
            >
              <span
                :class="[
                  selected ? 'font-semibold text-skin-link' : 'font-normal',
                  { 'text-skin-border': disabled },
                  'flex w-full items-center truncate'
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
          </ComboboxOption>
        </div>
      </ComboboxOptions>
    </div>
  </Combobox>
</template>
