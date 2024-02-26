<script setup lang="ts">
import {
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
  ComboboxLabel,
  ComboboxButton
} from '@headlessui/vue';
import MiniSearch from 'minisearch';

type ComboboxItem = {
  id: string;
  name: string;
  extras?: Record<string, any>;
};

const props = defineProps<{
  modelValue: string;
  items: ComboboxItem[];
  label?: string;
  hint?: string;
  placeholder?: string;
  disabled?: boolean;
  definition?: any;
  error?: string;
  showErrors?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

let miniSearch = new MiniSearch({
  fields: ['id', 'name'],
  storeFields: ['id'],
  searchOptions: {
    boost: { name: 2 },
    fuzzy: 0.6
  }
});

miniSearch.addAll(props.items);

const searchInput = ref('');
const selectedItem = computed({
  get: () => props.items.find(item => item.id === props.modelValue) || null,
  set: newVal =>
    newVal
      ? emit('update:modelValue', newVal.id)
      : emit('update:modelValue', '')
});

const filteredItems = computed(() => {
  if (searchInput.value === '') {
    return props.items.filter(item => !item.extras?.hidden);
  }

  const searchLower = searchInput.value.toLowerCase();
  const searchResults = new Set(miniSearch.search(searchLower).map(i => i.id));

  return props.items.filter(item => {
    const isIncluded = item.name.toLowerCase().includes(searchLower);
    const isSearchResult = searchResults.has(item.id);
    const isNotHidden = !item.extras?.hidden;

    return (isIncluded || isSearchResult) && isNotHidden;
  });
});
</script>
<template>
  <div class="w-full">
    <Combobox
      v-model="selectedItem"
      :disabled="disabled"
      as="div"
      class="w-full"
      nullable
    >
      <ComboboxLabel v-if="label || definition?.title" class="block">
        <TuneLabelInput :hint="hint || definition?.description">
          {{ label || definition.title }}
        </TuneLabelInput>
      </ComboboxLabel>
      <div class="relative">
        <ComboboxButton class="w-full">
          <ComboboxInput
            class="tune-input w-full py-2 !pr-[30px] pl-3 focus:outline-none"
            spellcheck="false"
            :display-value="(item: any) => item?.name"
            :class="{ 'cursor-not-allowed': disabled }"
            :placeholder="
              placeholder || definition?.examples[0] || 'Select option'
            "
            :disabled="disabled"
            @change="searchInput = $event.target.value"
          />
        </ComboboxButton>
        <ComboboxButton
          class="absolute inset-y-0 right-1 flex items-center px-2 focus:outline-none"
          :class="{ 'cursor-not-allowed': disabled }"
        >
          <i-ho-chevron-down class="text-sm text-skin-link" />
        </ComboboxButton>
        <ComboboxOptions
          v-if="filteredItems.length > 0"
          class="tune-listbox-options absolute z-40 mt-1 w-full overflow-hidden focus:outline-none"
        >
          <div class="max-h-[180px] overflow-y-auto">
            <ComboboxOption
              v-for="item in filteredItems"
              v-slot="{ active, selected, disabled: itemDisabled }"
              :key="item.id"
              as="template"
              :value="item"
            >
              <li
                :class="[
                  { active: active },
                  'tune-listbox-item relative cursor-default select-none truncate py-2 pl-3 pr-[50px]'
                ]"
              >
                <span
                  :class="[
                    selected ? 'selected' : 'font-normal',
                    { disabled: itemDisabled },
                    'tune-listbox-item block truncate'
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
                  <i-ho-check class="text-sm" />
                </span>
              </li>
            </ComboboxOption>
          </div>
        </ComboboxOptions>
      </div>
    </Combobox>
    <TuneErrorInput v-if="error && showErrors" :error="error" />
  </div>
</template>
