<script>
import { formatUnits } from '@ethersproject/units';
import { getAbiFirstFunctionName } from '@/helpers/abi/utils';

const labels = {
  contractInteraction: 'Contract Interaction',
  transferFunds: 'Transfer Funds',
  transferNFT: 'Transfer NFT',
  raw: 'Raw Transaction'
};

export default {
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
  computed: {
    title() {
      if (this.open) {
        return '';
      }

      if (this.modelValue) {
        try {
          const recipientAddr = this._shorten(this.modelValue.recipient);
          const toAddr = this._shorten(this.modelValue.to);
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
                id: this._shorten(this.modelValue.collectable.id, 10),
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
    :hideRemove="config.preview"
    :number="nonce + 1"
    :open="open"
    :title="title"
    @remove="$emit('remove')"
    @toggle="open = !open"
  >
    <UiSelect
      :disabled="config.preview"
      :modelValue="type"
      @update:modelValue="handleTypeChange($event)"
    >
      <template v-slot:label>{{ $t('safeSnap.type') }}</template>
      <option value="transferFunds">{{ $t('safeSnap.transferFunds') }}</option>
      <option value="transferNFT">{{ $t('safeSnap.transferNFT') }}</option>
      <option value="contractInteraction">
        {{ $t('safeSnap.contractInteraction') }}
      </option>
      <option value="raw">{{ $t('safeSnap.rawTransaction') }}</option>
    </UiSelect>

    <PluginSafeSnapFormContractInteraction
      v-if="type === 'contractInteraction'"
      :config="config"
      :modelValue="modelValue"
      :nonce="nonce"
      @update:modelValue="$emit('update:modelValue', $event)"
    />

    <PluginSafeSnapFormTransferFunds
      v-if="type === 'transferFunds'"
      :config="config"
      :modelValue="modelValue"
      :nonce="nonce"
      @update:modelValue="$emit('update:modelValue', $event)"
    />

    <PluginSafeSnapFormSendAsset
      v-if="type === 'transferNFT'"
      :config="config"
      :modelValue="modelValue"
      :nonce="nonce"
      @update:modelValue="$emit('update:modelValue', $event)"
    />

    <PluginSafeSnapFormRawTransaction
      v-if="type === 'raw'"
      :modelValue="modelValue"
      :nonce="nonce"
      :config="config"
      @update:modelValue="$emit('update:modelValue', $event)"
    />
  </UiCollapsible>
</template>
