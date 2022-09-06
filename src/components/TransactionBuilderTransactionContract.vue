<script setup lang="ts">
import { computed } from 'vue';
import { ContractTransaction } from '@/helpers/transactionBuilder';
import { getABIWriteFunctions } from '@/helpers/abi';

const props = defineProps<{
  transaction: ContractTransaction;
}>();

const method = computed(() => {
  const writeMethods = getABIWriteFunctions(props.transaction.abi);

  return writeMethods.find(method => method.name === props.transaction.method);
});
</script>

<template>
  <div>
    <div>Contract: {{ transaction.contractAddress }}</div>
    <div>Method: {{ transaction.method }}</div>
    <div v-if="method">
      <div v-for="(input, index) in method.inputs" :key="index">
        <div>{{ input.name }}: {{ transaction.params[index] }}</div>
      </div>
    </div>
  </div>
</template>
