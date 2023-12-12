<script setup lang="ts">
import { ref } from 'vue';
import { validateForm } from '@/helpers/validation';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';

type DelegateRowForm = {
  to: string;
  weight: number;
};

const props = defineProps<{
  address: string;
  weight: number;
}>();

const emit = defineEmits(['deleteDelegate', 'update:modelValue']);

const form = ref<DelegateRowForm>({
  to: props.address,
  weight: props.weight ?? 0
});

const definition = computed(() => {
  return {
    type: 'object',
    properties: {
      to: {
        type: 'string',
        format: 'address',
        title: 'Delegate to',
        description: 'The address, ENS or Lens of who you want to delegate to',
        examples: ['Address, ENS or Lens']
      },
      weight: {
        type: 'number',
        format: 'percentage'
      }
    },
    required: ['to', 'weight'],
    additionalProperties: false
  };
});

const validationErrors = computed(() => {
  return validateForm(definition.value || {}, clone(form.value));
});

const updateFormValue = <T extends keyof DelegateRowForm>(
  value: DelegateRowForm[T],
  field: T
) => {
  form.value[field] = value;
  emit('update:modelValue', clone(form.value));
};

// function handleWeightKeydown(e: KeyboardEvent) {
//   let increment = 0;

//   if (e.key === 'ArrowUp' && e.shiftKey) {
//     increment = 10;
//   } else if (e.key === 'ArrowDown' && e.shiftKey) {
//     increment = -10;
//   } else if (e.key === 'ArrowUp') {
//     increment = 1;
//   } else if (e.key === 'ArrowDown') {
//     increment = -1;
//   }

//   const newWeight = form.value.weight + increment;
//   if (newWeight < 0 || newWeight > 100) {
//     return;
//   }
//   handleWeightUpdate(newWeight);
// }

watch(
  () => props.address,
  newAddress => {
    form.value.to = newAddress;
  },
  { immediate: true }
);

watch(
  () => props.weight,
  newWeight => {
    form.value.weight = newWeight;
  },
  { immediate: true }
);
</script>

<template>
  <div class="items-end flex space-x-1">
    <div class="min-w-[66.7%] relative">
      <TuneInput
        :model-value="form.to"
        :placeholder="definition.properties.to.examples[0]"
        :class="{ 'tune-error-border': validationErrors?.to && form.to }"
        @update:model-value="event => updateFormValue(event, 'to')"
      />
    </div>
    <div class="relative">
      {{ console.log('validationErrors', validationErrors) }}
      <TuneInput
        :model-value="form.weight"
        type="number"
        :class="[
          'text-right pr-5',
          { 'tune-error-border': validationErrors?.weight }
        ]"
        @update:model-value="
          event => updateFormValue(parseFloat(event), 'weight')
        "
      />
      <!-- @keydown="e => handleWeightKeydown(e)" -->
      <div
        class="text-white absolute w-4 h-4 right-2 top-1/2 transform -translate-y-1/2"
      >
        %
      </div>
    </div>
    <BaseButtonIcon
      class="h-[42px] min-w-[42px] rounded-full border border-skin-border flex items-center justify-center tune-button"
      @click="() => $emit('deleteDelegate')"
    >
      <i-ho-x class="text-[17px]" />
    </BaseButtonIcon>
  </div>
  <TuneErrorInput
    v-if="validationErrors && form.to"
    :error="validationErrors?.to"
  />
  <TuneErrorInput v-if="validationErrors" :error="validationErrors?.weight" />
</template>
