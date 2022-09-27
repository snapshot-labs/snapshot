<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { ParamType } from '@ethersproject/abi';
import { ParamValue, ParamValueError } from '@/helpers/transactionBuilder';

const props = defineProps<{
  params: ParamType[];
  values: ParamValue[];
  label: string;
}>();

const emit = defineEmits<{
  (e: 'updateValues', values: ParamValue[]): void;
  (e: 'updateErrors', values: ParamValueError[]): void;
}>();

const input = ref<ParamValue[]>(props.values);
const errors = ref<ParamValueError[]>([]);

onMounted(() => (input.value = props.values));

watch(
  () => props.params,
  () => {
    input.value = props.values;
    errors.value = [];
  }
);
watch(input, () => emit('updateValues', input.value), { deep: true });
watch(errors, () => emit('updateErrors', errors.value), { deep: true });
</script>

<template>
  <div class="transaction-builder-form-tuple">
    <LabelInput>{{ label }}</LabelInput>
    <TransactionBuilderFormContractParams
      :params="params"
      :values="input"
      @update-values="input = $event"
      @update-errors="errors = $event"
    />
  </div>
</template>
