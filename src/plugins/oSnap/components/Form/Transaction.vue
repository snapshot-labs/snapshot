<script setup lang="ts">
import type { TransactionType } from '../../types';
import ContractInteraction from './ContractInteraction.vue';
import RawTransaction from './RawTransaction.vue';
import TransferNFT from './TransferNFT.vue';
import TransferFunds from './TransferFunds.vue';

const labels = {
  contractInteraction: 'Contract Interaction',
  transferFunds: 'Transfer Funds',
  transferNFT: 'Transfer NFT',
  raw: 'Raw Transaction'
};

defineProps<{
  modelValue: any;
  nonce: string;
  config: any;
}>();

defineEmits(['update:modelValue', 'remove']);

const type = ref<TransactionType>('transferFunds');
</script>

<template>
  <UiSelect
    :disabled="config.preview"
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
    :config="config"
    :model-value="modelValue"
    :nonce="nonce"
    @update:modelValue="$emit('update:modelValue', $event)"
  />

  <TransferFunds
    v-if="type === 'transferFunds'"
    :config="config"
    :model-value="modelValue"
    :nonce="nonce"
    @update:modelValue="$emit('update:modelValue', $event)"
  />

  <TransferNFT
    v-if="type === 'transferNFT'"
    :config="config"
    :model-value="modelValue"
    :nonce="nonce"
    @update:modelValue="$emit('update:modelValue', $event)"
  />

  <RawTransaction
    v-if="type === 'raw'"
    :model-value="modelValue"
    :nonce="nonce"
    :config="config"
    @update:modelValue="$emit('update:modelValue', $event)"
  />
</template>
