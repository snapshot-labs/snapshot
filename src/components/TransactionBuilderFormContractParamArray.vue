<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { ParamValue } from '@/helpers/transactionBuilder';
import { ParamType } from '@ethersproject/abi';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';

const props = withDefaults(
  defineProps<{
    childSample: ParamType;
    values: ParamValue[];
    label: string;
  }>(),
  {
    values: () => []
  }
);

const emit = defineEmits<{
  (e: 'updateValues', values: ParamValue[]): void;
}>();

const input = ref<ParamValue[]>(props.values);
const items = ref<ParamType[]>([]);

function addItem() {
  const child = clone(props.childSample);
  child.name = `${props.label} ${items.value.length + 1}`; // TODO: make this reactive
  items.value.push(child);
}

function removeItem(index: number) {
  input.value = input.value.filter((_, i) => i !== index);
  items.value = items.value.filter((_, i) => i !== index);
}

onMounted(() => {
  input.value = props.values;
  input.value.forEach(() => addItem());
});

watch(
  () => props.values,
  () => (input.value = props.values)
);

watch(input, () => emit('updateValues', input.value), { deep: true });
</script>

<template>
  <div class="transaction-builder-form-tuple">
    <LabelInput>{{ label }}</LabelInput>
    <TransactionBuilderFormContractParams
      :params="items"
      :values="input"
      :can-remove-items="true"
      @update-values="input = $event"
      @remove-item="removeItem"
    />
    <BaseButton @click="addItem">
      <i-ho-plus class="inline" /> add list item
    </BaseButton>
  </div>
</template>
