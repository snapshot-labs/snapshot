<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { ParamValue } from '@/helpers/transactionBuilder';
import { ParamType } from '@ethersproject/abi';

const props = withDefaults(
  defineProps<{
    type: string;
    values: ParamValue[];
    tupleComponents: ParamType[] | null;
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
  items.value.push(
    ParamType.from({
      type: props.type,
      name: `${props.label} ${items.value.length + 1}`
    })
  );
}

function removeItem(index: number) {
  input.value.splice(index, 1);
  items.value.splice(index, 1);
}

onMounted(() => (input.value = props.values));

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
