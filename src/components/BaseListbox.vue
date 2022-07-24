<script setup lang="ts">
import { computed } from 'vue';
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
  ListboxLabel
} from '@headlessui/vue';

type ListboxItem = { id: number | string; name: string; value?: any };

const props = defineProps<{
  items: ListboxItem[];
  modelValue: any;
  label?: string;
  disableInput?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const selectedItem = computed({
  get: () => props.items.find(item => item.value === props.modelValue),
  set: newVal => emit('update:modelValue', newVal?.value)
});
</script>

<template>
  <Listbox v-model="selectedItem" as="div" :disabled="disableInput">
    <ListboxLabel>
      <LabelInput>{{ label }}</LabelInput>
    </ListboxLabel>
    <div class="relative">
      <ListboxButton
        class="relative h-[42px] w-full truncate rounded-full border border-skin-border pl-3 pr-[40px] text-left text-skin-link hover:border-skin-text"
        :class="{ 'cursor-not-allowed text-skin-border': disableInput }"
      >
        <slot
          v-if="$slots.selected"
          name="selected"
          :selectedItem="selectedItem"
        />

        <span v-else-if="selectedItem">
          {{ selectedItem.name }}
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
