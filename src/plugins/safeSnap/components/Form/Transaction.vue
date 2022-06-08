<script>
import { formatUnits } from '@ethersproject/units';
import { getAbiFirstFunctionName } from '../../index';
import { shorten } from '@/helpers/utils';
import SafeSnapFormContractInteraction from './ContractInteraction.vue';
import SafeSnapFormTransferFunds from './TransferFunds.vue';
import SafeSnapFormSendAsset from './SendAsset.vue';
import SafeSnapFormRawTransaction from './RawTransaction.vue';

const labels = {
  contractInteraction: 'Contract Interaction',
  transferFunds: 'Transfer Funds',
  transferNFT: 'Transfer NFT',
  raw: 'Raw Transaction'
};

export default {
  components: {
    SafeSnapFormContractInteraction,
    SafeSnapFormTransferFunds,
    SafeSnapFormSendAsset,
    SafeSnapFormRawTransaction
  },
  props: ['modelValue', 'nonce', 'config'],
  emits: ['update:modelValue', 'remove'],
  data() {
    let type = 'transferFunds';
    if (this.modelValue) {
      type = this.modelValue.type ? this.modelValue.type : 'raw';
    }

    return {
      open: !this.config.preview,
      type
    };
  },
  computed: {
    title() {
      if (this.open) {
        return '';
      }

      if (this.modelValue) {
        try {
          const recipientAddr = shorten(this.modelValue.recipient);
          const toAddr = shorten(this.modelValue.to);
          const type = this.modelValue.type || this.type;
          switch (type) {
            case 'contractInteraction':
              return this.$t('safeSnap.transactionLabels.contractInteraction', {
                functionName: getAbiFirstFunctionName(this.modelValue.abi),
                amount: this.modelValue.value,
                address: toAddr
              });
            case 'transferFunds':
              return this.$t('safeSnap.transactionLabels.transferFunds', {
                amount: formatUnits(
                  this.modelValue.amount,
                  this.modelValue.token.decimals
                ),
                tokenSymbol: this.modelValue.token.symbol,
                address: recipientAddr
              });
            case 'transferNFT':
              return this.$t('safeSnap.transactionLabels.transferNFT', {
                name: this.modelValue.collectable.name,
                id: shorten(this.modelValue.collectable.id, 10),
                address: recipientAddr
              });
            case 'raw':
              return this.$t('safeSnap.transactionLabels.raw', {
                amount: this.modelValue.value,
                address: recipientAddr
              });
          }
        } catch (error) {
          console.log('could not determine title', error);
        }
      }
      return this.getLabel(this.type);
    }
  },
  watch: {
    modelValue() {
      if (this.modelValue?.type) {
        this.type = this.modelValue.type;
      }
    }
  },
  mounted() {
    if (!this.config.preview) this.$emit('update:modelValue', undefined);
    if (this.config.preview && !this.modelValue.type) {
      this.type = 'raw';
    }
  },
  methods: {
    getLabel(type) {
      return labels[type];
    },
    handleTypeChange(type) {
      this.type = type;
      this.$emit('update:modelValue', undefined);
    }
  }
};
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
      :model-value="type"
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
      v-if="type === 'contractInteraction'"
      :config="config"
      :model-value="modelValue"
      :nonce="nonce"
      @update:modelValue="$emit('update:modelValue', $event)"
    />

    <SafeSnapFormTransferFunds
      v-if="type === 'transferFunds'"
      :config="config"
      :model-value="modelValue"
      :nonce="nonce"
      @update:modelValue="$emit('update:modelValue', $event)"
    />

    <SafeSnapFormSendAsset
      v-if="type === 'transferNFT'"
      :config="config"
      :model-value="modelValue"
      :nonce="nonce"
      @update:modelValue="$emit('update:modelValue', $event)"
    />

    <SafeSnapFormRawTransaction
      v-if="type === 'raw'"
      :model-value="modelValue"
      :nonce="nonce"
      :config="config"
      @update:modelValue="$emit('update:modelValue', $event)"
    />
  </UiCollapsible>
</template>
