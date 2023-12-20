<script setup lang="ts">
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
  ListboxLabel
} from '@headlessui/vue';
import isEqual from 'lodash/isEqual';

type ListboxItem = {
  value: any;
  name?: string;
  extras?: Record<string, any>;
};

const props = defineProps<{
  items: ListboxItem[];
  modelValue: any;
  label?: string;
  disabled?: boolean;
  definition?: any;
  hint?: string;
  error?: string;
}>();

const emit = defineEmits(['update:modelValue']);

const selectedItem = computed({
  get: () =>
    props.items.find(item => isEqual(item.value, props.modelValue)) ?? {
      value: ''
    },
  set: newVal => emit('update:modelValue', newVal.value)
});

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
    <Listbox v-model="selectedItem" as="div" :disabled="disabled">
      <ListboxLabel>
        <TuneLabelInput :hint="hint || definition?.description">
          {{ label || definition?.title }}
        </TuneLabelInput>
      </ListboxLabel>
      <div class="relative">
        <ListboxButton
          class="tune-listbox-button relative h-[42px] w-full truncate pl-3 pr-[40px] text-left"
          :class="[
            { 'disabled cursor-not-allowed': disabled },
            {
              error: showErrorMessage && error
            }
          ]"
        >
          <slot
            v-if="$slots.selected"
            name="selected"
            :selected-item="selectedItem"
          />

          <span v-else-if="selectedItem?.value">
            {{ selectedItem?.name || selectedItem?.value }}
          </span>
          <span v-else class="tune-listbox-placeholder"> Select </span>
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
                v-for="item in items"
                :key="item.value"
                v-slot="{ active, selected, disabled: itemDisabled }"
                as="template"
                :value="item"
              >
                <li
                  :class="[
                    { active: active && !itemDisabled },
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
