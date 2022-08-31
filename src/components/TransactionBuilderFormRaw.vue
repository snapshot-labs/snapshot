<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { BigNumber } from '@ethersproject/bignumber';
import {
  RawTransaction,
  TransactionOperationType
} from '@/helpers/transactionBuilder';

const props = defineProps<{
  transaction: RawTransaction;
}>();

const emit = defineEmits<{
  (e: 'updateTransaction', transaction: RawTransaction): void;
}>();

const to = ref<string>(props.transaction.to);
const value = ref<BigNumber>(props.transaction.value);
const data = ref<string>(props.transaction.data);

onMounted(async () => {
  to.value = props.transaction.to;
  value.value = props.transaction.value;
  data.value = props.transaction.data;
});

watch([to, value, data], () => {
  emit('updateTransaction', {
    to: to.value,
    value: value.value,
    data: data.value,
    operation: TransactionOperationType.CALL
  });
});
</script>

<template>
  <div class="space-y-2">
    <div>
      <LabelInput>To</LabelInput>
      <InputString v-model="to" placeholder="0x..." />
    </div>
    <div>
      <LabelInput>Value</LabelInput>
      <InputNumber
        :model-value="value.toString()"
        @update:model-value="value = BigNumber.from($event)"
      />
    </div>
    <div>
      <LabelInput>Data</LabelInput>
      <InputString v-model="data" placeholder="0x..." />
    </div>
  </div>
</template>
