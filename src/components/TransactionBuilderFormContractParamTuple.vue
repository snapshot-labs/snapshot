<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { ParamType } from '@ethersproject/abi';
import { ParamValue } from '@/helpers/transactionBuilder';

const props = withDefaults(
  defineProps<{
    params: ParamType[];
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

onMounted(() => (input.value = props.values));

watch(input, () => emit('updateValues', input.value), { deep: true });
</script>

<template>
  <div class="transaction-builder-form-tuple">
    <LabelInput>{{ label }}</LabelInput>
    <TransactionBuilderFormContractParams
      :params="params"
      :values="input"
      @update-values="input = $event"
    />
  </div>
</template>
