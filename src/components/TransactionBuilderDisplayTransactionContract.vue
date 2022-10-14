<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { formatUnits } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';
import { shortenAddress } from '@/helpers/utils';
import {
  Transaction,
  decodeContractData,
  bigNumberValuesToString,
  ParamValue
} from '@/helpers/transactionBuilder';
import { FunctionFragment } from '@ethersproject/abi';

const props = defineProps<{
  transaction: Transaction;
  network: string;
  abi?: string;
}>();

const contractAddress = ref<string>('');
const useCustomData = ref<boolean>(false);
const targetMethod = ref<FunctionFragment>();
const paramValues = ref<ParamValue[]>([]);
const value = ref<BigNumber>(BigNumber.from(0));
const data = ref<string>('');

onMounted(async () => {
  contractAddress.value = props.transaction.to;
  if (props.abi) {
    useCustomData.value = false;
    const { method, values } = decodeContractData(
      props.transaction.data,
      props.abi
    );
    targetMethod.value = method;
    paramValues.value = method.inputs.map((_, i) =>
      bigNumberValuesToString(values[i])
    );
  } else {
    useCustomData.value = true;
    value.value = props.transaction.value;
    data.value = props.transaction.data;
  }
});
</script>

<template>
  <div class="flex flex-col items-start justify-start truncate">
    <template v-if="useCustomData">
      <span>Contract: {{ shortenAddress(contractAddress) }}</span>
      <span>Value: {{ formatUnits(value) }}</span>
      <span>Data: {{ data }}</span>
    </template>
    <template v-else>
      <span>Contract: {{ shortenAddress(contractAddress) }}</span>
      <span>Method: {{ targetMethod?.name }}</span>
      <span>Arguments:</span>
      <div
        v-for="(param, index) in targetMethod?.inputs"
        :key="index"
        class="truncate"
      >
        - {{ param.name }}: {{ paramValues[index] }}
      </div>
    </template>
  </div>
</template>
