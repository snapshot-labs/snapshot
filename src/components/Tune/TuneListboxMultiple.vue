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
  name?: string;
  extras?: Record<string, any>;
};

const props = defineProps<{
  modelValue?: string[];
  items: ListboxItem[];
  definition?: any;
  label?: string;
  placeholder?: string;
  limit?: number;
  disabled?: boolean;
  hint?: string;
  error?: string;
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

const showErrorMessage = ref(false);

function forceShowError() {
  showErrorMessage.value = true;
}

defineExpose({
  forceShowError
});
</script>

<template>
  <div>
    <Listbox v-model="selectedItems" as="div" :disabled="disabled" multiple>
      <ListboxLabel>
        <TuneLabelInput :hint="hint || definition?.description">
          {{ label || definition?.title }}
        </TuneLabelInput>
      </ListboxLabel>
      <div class="relative">
        <ListboxButton
          v-tippy="{
            content: selectedItems
              .map(item => item?.name || item.value)
              .join(', ')
          }"
          :class="[
            'tune-listbox-button relative h-[42px] w-full truncate pl-3 pr-[40px] text-left',
            { 'disabled cursor-not-allowed': disabled },
            {
              error: showErrorMessage && error
            }
          ]"
        >
          <span
            v-if="selectedItems.length < 1"
            class="tune-listbox-placeholder"
          >
            {{ placeholder || definition?.examples?.[0] }}
          </span>

          <slot
            v-else-if="$slots.selected"
            name="selected"
            :selected-items="selectedItems"
          />

          <span v-else>
            {{ selectedItems.map(item => item?.name || item.value).join(', ') }}
          </span>
          <span
            class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-[12px]"
          >
            <i-ho-chevron-down class="text-sm text-skin-link" />
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
            class="tune-listbox-options absolute z-40 mt-1 w-full overflow-hidden focus:outline-none"
          >
            <div class="max-h-[180px] overflow-y-auto">
              <ListboxOption
                v-for="(item, i) in items"
                :key="i"
                v-slot="{ active, selected, disabled: itemDisabled }"
                as="template"
                :value="item"
                :disabled="isItemDisabled(item.value)"
              >
                <li
                  :class="[
                    { active: active },
                    'tune-listbox-item relative cursor-default select-none py-2 pl-3 pr-[50px]'
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
                      {{ item?.name || item.value }}
                    </span>
                  </span>

                  <span
                    v-if="selected"
                    :class="[
                      'absolute inset-y-0 right-0 flex items-center pr-3'
                    ]"
                  >
                    <i-ho-check class="text-sm" />
                  </span>
                </li>
              </ListboxOption>
            </div>
          </ListboxOptions>
        </transition>
      </div>
    </Listbox>
    <TuneErrorInput v-if="error && showErrorMessage" :error="error" />
  </div>
</template>
