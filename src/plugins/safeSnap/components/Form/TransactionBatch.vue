<script setup lang="ts">
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { useSafe } from '@/composables';
import { createBatch } from '@/plugins/safeSnap/utils';
import { ERC20_ABI, ERC721_ABI } from '@/plugins/safeSnap/constants';
import { formatEther } from '@ethersproject/units';
import { FunctionFragment, Interface } from '@ethersproject/abi';
import SafeSnapFormTransaction from './Transaction.vue';
import { onMounted, ref } from 'vue';

const props = defineProps(['modelValue', 'nonce', 'config']);
const emit = defineEmits(['update:modelValue', 'remove']);

const { safesnap } = useSafe();

const open = ref(true);
const hashHidden = ref(true);
const jsonHidden = ref(true);
const transactions = ref(
  props.modelValue ? clone(props.modelValue.transactions) : []
);

const addEmptyTransaction = () => {
  transactions.value.push(undefined);
};

const updateBatch = txs => {
  const batch = createBatch(
    props.config.realityAddress,
    parseInt(props.config.network),
    props.nonce,
    txs,
    props.config.multiSendAddress
  );
  emit('update:modelValue', batch);
};

const updateTransaction = (index, transaction) => {
  transactions.value[index] = transaction;
  updateBatch(transactions.value);
};

const removeTransaction = index => {
  transactions.value.splice(index, 1);
  updateBatch(transactions.value);
  if (!transactions.value.length) {
    emit('remove');
  }
};

const formatBatchJson = txs => {
  const valid = txs.every(tx => tx);
  if (!valid) {
    return null;
  }
  return txs.map(tx => {
    const base = {
      to: tx.to,
      operation: tx.operation,
      value: formatEther(tx.value),
      data: ''
    };

    let abi = tx.abi;
    if (tx.data.length > 2) {
      switch (tx.type) {
        case 'transferFunds':
          abi = ERC20_ABI;
          break;
        case 'transferNFT':
          abi = ERC721_ABI;
          break;
        default:
          base.data = tx.data;
          break;
      }
    }

    if (abi) {
      const functionSelector = tx.data.substr(0, 10);
      const contractInterface = new Interface(abi);
      const functionFragment = contractInterface.fragments
        .filter(frag => FunctionFragment.isFunctionFragment(frag))
        .find(frag => contractInterface.getSighash(frag) === functionSelector);

      if (functionFragment) {
        const func = FunctionFragment.from(functionFragment);
        const params = contractInterface.decodeFunctionData(func, tx.data);
        return {
          ...base,
          method: func.format(),
          params: params.map(param => param.toString())
        };
      }
    }
    return base;
  });
};

onMounted(() => {
  if (!transactions.value.length) {
    addEmptyTransaction();
  }
});
</script>

<template>
  <UiCollapsible
    borderless
    :number="nonce + 1"
    :open="open"
    :title="`${$t('safeSnap.batch')} (${transactions.length})`"
    @remove="$emit('remove')"
    @toggle="open = !open"
  >
    <div v-for="(transaction, index) in transactions" :key="index" class="mb-2">
      <SafeSnapFormTransaction
        :model-value="transaction"
        :config="config"
        :nonce="index"
        @remove="removeTransaction(index)"
        @update:modelValue="updateTransaction(index, $event)"
      />
    </div>
    <UiCollapsibleText
      v-if="modelValue.hash"
      :show-arrow="true"
      :open="!hashHidden"
      class="mt-2 rounded-3xl"
      title="Batch Transaction Hash"
      @toggle="hashHidden = !hashHidden"
    >
      {{ modelValue.hash }}
    </UiCollapsibleText>
    <UiCollapsibleText
      v-if="modelValue.hash"
      :show-arrow="true"
      :pre="true"
      :open="!jsonHidden"
      class="mt-2 rounded-3xl"
      title="Batch Transaction JSON"
      @toggle="jsonHidden = !jsonHidden"
    >
      {{ JSON.stringify(formatBatchJson(modelValue.transactions), null, '\t') }}
    </UiCollapsibleText>
    <BaseBlock
      v-if="
        safesnap.batchError &&
        safesnap.batchError.message &&
        nonce === safesnap.batchError.num
      "
      class="mt-4"
      style="border-color: red !important"
    >
      <BaseIcon name="warning" class="mr-2 !text-red" />
      <span class="!text-red"> Error: {{ safesnap.batchError.message }}</span>
    </BaseBlock>

    <BaseButton class="mt-2" @click="addEmptyTransaction">
      {{ $t('safeSnap.addTransaction') }}
    </BaseButton>
  </UiCollapsible>
</template>
