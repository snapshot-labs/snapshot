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
  modelValue: string[];
  items: ComboboxItem[];
  label?: string;
  hint?: string;
  disabled?: boolean;
  definition?: any;
}>();

const emit = defineEmits(['update:modelValue']);

let miniSearch = new MiniSearch({
  fields: ['id', 'name'],
  storeFields: ['id'],
  searchOptions: {
    boost: { name: 2 },
    fuzzy: 0.4
  }
});

miniSearch.addAll(props.items);

const searchInput = ref('');
const selectedItems = computed({
  get: () => props.items.filter(item => props.modelValue.includes(item.id)),
  set: newVal =>
    emit(
      'update:modelValue',
      newVal.map((item: any) => item.id)
    )
});

const filteredItems = computed(() => {
  if (searchInput.value === '') {
    return props.items;
  }

  const miniSearchIds = miniSearch.search(searchInput.value).map(i => i.id);

  const includesIds = props.items
    ?.filter(i =>
      i.name.toLowerCase().includes(searchInput.value.toLowerCase())
    )
    .map(i => i.id);

  const filterIds = [...miniSearchIds, ...includesIds];

  const filteredItems = props.items.filter(item => {
    return filterIds.includes(item.id);
  });

  return filteredItems;
});
</script>
<template>
  <Combobox
    v-model="selectedItems"
    multiple
    :disabled="disabled"
    as="div"
    class="w-full"
  >
    <ComboboxLabel v-if="label || definition?.title" class="block">
      <TuneLabelInput :hint="hint || definition?.description">
        {{ label || definition.title }}
      </TuneLabelInput>
    </ComboboxLabel>
    <div class="relative">
      <ComboboxButton class="tune-listbox-button w-full">
        <div class="no-scrollbar flex items-center overflow-x-auto">
          <div v-if="selectedItems.length" class="whitespace-nowrap py-2 pl-2">
            <span
              v-for="item in selectedItems"
              :key="item.id"
              class="mr-1 inline-block"
            >
              <TuneTag :label="item.name" />
            </span>
          </div>

          <ComboboxInput
            class="mr-1 w-full min-w-[200px] py-2 !pr-[30px] pl-2 focus:outline-none"
            spellcheck="false"
            :class="{ 'cursor-not-allowed': disabled }"
            :disabled="disabled"
            @blur="searchInput = ''"
            @change="searchInput = $event.target.value"
          />
        </div>
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
</template>
