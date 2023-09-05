<script setup lang="ts">
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
  ListboxLabel
} from '@headlessui/vue';

type ListboxItem = {
  value: any;
  title?: string;
  extras?: Record<string, any>;
};

const props = defineProps<{
  items: ListboxItem[];
  label?: string;
  placeholder?: string;
  modelValue?: string[];
  limit?: number;
  isDisabled?: boolean;
  definition?: any;
  information?: string;
}>();

const emit = defineEmits(['update:modelValue']);

const selectedItems = computed({
  get: () =>
    props.items.filter(item => props.modelValue?.includes(item.value)) || [],
  set: newVal =>
    emit(
      'update:modelValue',
      newVal.map(item => item.value)
    )
});

function isItemDisabled(item: string) {
  if (!props.limit) return false;
  if (selectedItems.value.length < props.limit) return false;
  return !selectedItems.value.some(selectedItem => selectedItem.value === item);
}
</script>

<template>
  <Listbox v-model="selectedItems" as="div" :disabled="isDisabled" multiple>
    <ListboxLabel v-if="label || definition?.title">
      <LabelInput :information="information || definition?.description">
        {{ label || definition?.title }}
      </LabelInput>
    </ListboxLabel>
    <div class="relative">
      <ListboxButton
        v-tippy="{
          content: selectedItems
            .map(item => item?.title || item.value)
            .join(', ')
        }"
        class="relative h-[42px] w-full truncate rounded-full border border-skin-border pl-3 pr-[40px] text-left text-skin-link hover:border-skin-text"
        :class="{ 'cursor-not-allowed !border-skin-border': isDisabled }"
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
          {{ selectedItems.map(item => item?.title || item.value).join(', ') }}
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
          <div class="max-h-[180px] overflow-y-auto">
            <ListboxOption
              v-for="(item, i) in items"
              :key="i"
              v-slot="{ active, selected, disabled }"
              as="template"
              :value="item"
              :disabled="isItemDisabled(item.value)"
            >
              <li
                :class="[
                  { 'bg-skin-border': active },
                  'relative cursor-default select-none py-2 pl-3 pr-[50px]'
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
                    {{ item?.title || item.value }}
                  </span>
                </span>

                <span
                  v-if="selected"
                  :class="['absolute inset-y-0 right-0 flex items-center pr-3']"
                >
                  <i-ho-check class="text-green" />
                </span>
              </li>
            </ListboxOption>
          </div>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
</template>
