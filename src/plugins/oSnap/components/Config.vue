<script setup lang="ts">
import { getIpfsUrl } from '@/helpers/utils';
import { getSafeHash, isValidInput } from '../index';

import { ExtendedSpace, Proposal, Results } from '@/helpers/interfaces';
import SafeTransactions from './SafeTransactions.vue';
import { OptimisticGovernorTransaction, TransactionBuilderModelValue } from '../types';

const props = defineProps<{
  modelValue: TransactionBuilderModelValue;
  proposal: Proposal;
  space: ExtendedSpace;
  preview: boolean;
  results?: Results;
}>();

const emit = defineEmits<{
  update: [modelValue: TransactionBuilderModelValue];
}>();

const transactions = ref<OptimisticGovernorTransaction[]>(props.modelValue.transactions ?? []);

const ipfs = getIpfsUrl(props.proposal.ipfs);

function updateTransactions() {
  if (props.preview) return;
  emit('update:modelValue', transactions);
}
</script>

<template>
  <div
    v-if="!preview"
    class="mb-4 rounded-none border-b border-t bg-skin-block-bg md:rounded-xl md:border"
  >
    <div
      class="block border-b px-4 pt-3"
      style="
        padding-bottom: 12px;
        display: flex;
        justify-content: space-between;
      "
    >
      <h4>
        {{ $t('safeSnap.transactions') }}
      </h4>
      <BaseLink v-if="ipfs" :link="ipfs"> View Details </BaseLink>
    </div>

    <div
      v-for="(treasury, index) in space.treasuries"
      :key="index"
      class="border-b last:border-b-0"
    >
      <SafeTransactions
        v-if="!preview"
        :preview="preview"
        :proposal="proposal"
        :space="space"
        :results="results"
        :model-value="transactions[index]"
        :treasury="treasury"
        @update:modelValue="updateTransactions()"
      />
    </div>
  </div>
</template>
