<script setup lang="ts">
import type {
  TransactionBuilderConfig,
  TransactionModelValue,
  TransactionType
} from '../../types';
import ContractInteraction from './ContractInteraction.vue';
import RawTransaction from './RawTransaction.vue';
import TransferFunds from './TransferFunds.vue';
import TransferNFT from './TransferNFT.vue';

const labels = {
  contractInteraction: 'Contract Interaction',
  transferFunds: 'Transfer Funds',
  transferNFT: 'Transfer NFT',
  raw: 'Raw Transaction'
};

type Props = TransactionBuilderConfig & {
  modelValue: TransactionModelValue;
};

const props = defineProps<Props>();

defineEmits(['update:modelValue', 'remove']);

const type = ref<TransactionType>(props.transactionType);
</script>

<template>
  <UiSelect
    :disabled="preview"
    :model-value="type"
    @update:modelValue="type = $event"
  >
    <template #label>{{ $t('safeSnap.type') }}</template>
    <option value="transferFunds">{{ $t('safeSnap.transferFunds') }}</option>
    <option value="transferNFT">{{ $t('safeSnap.transferNFT') }}</option>
    <option value="contractInteraction">
      {{ $t('safeSnap.contractInteraction') }}
    </option>
    <option value="raw">{{ $t('safeSnap.rawTransaction') }}</option>
  </UiSelect>

  <ContractInteraction
    v-if="type === 'contractInteraction'"
    v-bind="props"
    @update:modelValue="$emit('update:modelValue', $event)"
  />

  <TransferFunds
    v-if="type === 'transferFunds'"
    v-bind="props"
    @update:modelValue="$emit('update:modelValue', $event)"
  />

  <TransferNFT
    v-if="type === 'transferNFT'"
    v-bind="props"
    @update:modelValue="$emit('update:modelValue', $event)"
  />

  <RawTransaction
    v-if="type === 'raw'"
    v-bind="props"
    @update:modelValue="$emit('update:modelValue', $event)"
  />
</template>
