<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { formatUnits } from '@ethersproject/units';
import { getAbiFirstFunctionName } from '@/plugins/safeSnap/utils/abi';
import { shorten } from '@/helpers/utils';
import { useI18n } from '@/composables';
import SafeSnapFormContractInteraction from './ContractInteraction.vue';
import SafeSnapFormTransferFunds from './TransferFunds.vue';
import SafeSnapFormTransferNft from './TransferNft.vue';
import SafeSnapFormRawTransaction from './RawTransaction.vue';

const { t } = useI18n();

const labels = {
  contractInteraction: 'Contract Interaction',
  transferFunds: 'Transfer Funds',
  transferNFT: 'Transfer NFT',
  raw: 'Raw Transaction'
};

const props = defineProps(['modelValue', 'nonce', 'config']);
const emit = defineEmits(['update:modelValue', 'remove']);

const selectedType = ref('transferFunds');
if (props.modelValue) {
  selectedType.value = props.modelValue.type ? props.modelValue.type : 'raw';
}

const open = ref(!props.config.preview);

const getLabel = type => {
  return labels[type];
};

const title = computed(() => {
  if (open.value) {
    return '';
  }

  if (props.modelValue) {
    try {
      const recipientAddr = shorten(props.modelValue.recipient);
      const toAddr = shorten(props.modelValue.to);
      switch (props.modelValue.type || selectedType.value) {
        case 'contractInteraction':
          return t('safeSnap.transactionLabels.contractInteraction', {
            functionName: getAbiFirstFunctionName(props.modelValue.abi),
            amount: props.modelValue.value,
            address: toAddr
          });
        case 'transferFunds':
          return t('safeSnap.transactionLabels.transferFunds', {
            amount: formatUnits(
              props.modelValue.amount,
              props.modelValue.token.decimals
            ),
            tokenSymbol: props.modelValue.token.symbol,
            address: recipientAddr
          });
        case 'transferNFT':
          return t('safeSnap.transactionLabels.transferNFT', {
            name: props.modelValue.collectable.name,
            id: shorten(props.modelValue.collectable.id, 10),
            address: recipientAddr
          });
        case 'raw':
          return t('safeSnap.transactionLabels.raw', {
            amount: props.modelValue.value,
            address: recipientAddr
          });
      }
    } catch (error) {
      console.log('could not determine title', error);
    }
  }
  return getLabel(selectedType.value);
});

const handleTypeChange = type => {
  type.value = type;
  emit('update:modelValue', undefined);
};

onMounted(() => {
  if (!props.config.preview) emit('update:modelValue', undefined);
  if (props.config.preview && !props.modelValue.type) {
    selectedType.value = 'raw';
  }
});

watch(
  () => props.modelValue,
  () => {
    if (props.modelValue?.type) {
      selectedType.value = props.modelValue.type;
    }
  }
);
</script>

<template>
  <UiCollapsible
    :hide-remove="config.preview"
    :number="nonce + 1"
    :open="open"
    :title="title"
    @remove="$emit('remove')"
    @toggle="open = !open"
  >
    <UiSelect
      :disabled="config.preview"
      :model-value="selectedType"
      @update:modelValue="handleTypeChange($event)"
    >
      <template #label>{{ $t('safeSnap.type') }}</template>
      <option value="transferFunds">{{ $t('safeSnap.transferFunds') }}</option>
      <option value="transferNFT">{{ $t('safeSnap.transferNFT') }}</option>
      <option value="contractInteraction">
        {{ $t('safeSnap.contractInteraction') }}
      </option>
      <option value="raw">{{ $t('safeSnap.rawTransaction') }}</option>
    </UiSelect>

    <SafeSnapFormContractInteraction
      v-if="selectedType === 'contractInteraction'"
      :config="config"
      :model-value="modelValue"
      :nonce="nonce"
      @update:modelValue="$emit('update:modelValue', $event)"
    />

    <SafeSnapFormTransferFunds
      v-if="selectedType === 'transferFunds'"
      :config="config"
      :model-value="modelValue"
      :nonce="nonce"
      @update:modelValue="$emit('update:modelValue', $event)"
    />

    <SafeSnapFormTransferNft
      v-if="selectedType === 'transferNFT'"
      :config="config"
      :model-value="modelValue"
      :nonce="nonce"
      @update:modelValue="$emit('update:modelValue', $event)"
    />

    <SafeSnapFormRawTransaction
      v-if="selectedType === 'raw'"
      :model-value="modelValue"
      :nonce="nonce"
      :config="config"
      @update:modelValue="$emit('update:modelValue', $event)"
    />
  </UiCollapsible>
</template>
