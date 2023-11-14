<script>
import { formatUnits } from '@ethersproject/units';
import { getAbiFirstFunctionName } from '../../index';
import { shorten } from '@/helpers/utils';
import SafeSnapFormContractInteraction from './ContractInteraction.vue';
import SafeSnapFormTransferFunds from './TransferFunds.vue';
import SafeSnapFormSendAsset from './SendAsset.vue';
import SafeSnapFormRawTransaction from './RawTransaction.vue';
import SafeSnapFormConnextTransaction from './ConnextTransaction.vue';

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
    SafeSnapFormRawTransaction,
    SafeSnapFormConnextTransaction
  },
  props: [
    'modelValue',
    'connextModelValue',
    'nonce',
    'config',
    'isDetails',
    'transactionType',
    'simulationState'
  ],
  emits: ['update:modelValue', 'remove', 'edit'],
  data() {
    let type = 'transferFunds';
    if (this.modelValue) {
      type = this.modelValue.type ? this.modelValue.type : 'raw';
    }

    return {
      transactionType: this.transactionType,
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
      if (this.modelValue?.type) {
        this.type = this.modelValue.type;
      }
    },
    transactionType(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.transactionType = newVal;
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
    },
    handleFormUpdate(event) {
      this.$emit('update:modelValue', event);
    },
    handleEditTransaction() {
      this.$emit('edit');
    },
    showNonce() {
      if (this.transactionType === 'connext') {
        const tx = this.connextModelValue;
        const nonceTransferFunds = parseInt(tx[0].nonce);
        const nonceRaw = parseInt(tx[1].nonce);
        return `${nonceTransferFunds + 1}-${nonceRaw + 1}`;
      }
      return this.nonce + 1;
    }
  }
};
</script>

<template>
  <UiCollapsible
    :hide-remove="config.preview"
    :number="showNonce()"
    :open="open"
    :title="!!title ? title : 'Transaction'"
    :show-arrow="true"
    :show-edit="true"
    @remove="$emit('remove')"
    @toggle="open = !open"
    @edit="handleEditTransaction"
  >
    <div v-if="isDetails" class="my-2 flex px-3">
      <div class="flex space-x-2">
        <p class="text-skin-text">Transaction Type</p>
        <p v-if="transactionType.includes('standard')">Standard</p>
        <p v-if="transactionType.includes('connext')">
          Cross-chain Transaction (via Connext)
        </p>
      </div>
    </div>
    <div v-if="transactionType.includes('standard')" class="pb-3">
      <UiSelect
        v-if="!isDetails"
        :custom-styles="'safesnap-custom-select'"
        :disabled="config.preview"
        :model-value="type"
        @update:modelValue="handleTypeChange($event)"
      >
        <template #label>{{ $t('safeSnap.type') }}</template>
        <option value="transferFunds">
          {{ $t('safeSnap.transferFunds') }}
        </option>
        <option value="transferNFT">{{ $t('safeSnap.transferNFT') }}</option>
        <option value="contractInteraction">
          {{ $t('safeSnap.contractInteraction') }}
        </option>
        <option value="raw">{{ $t('safeSnap.rawTransaction') }}</option>
      </UiSelect>

      <div v-if="type && isDetails" class="my-2 flex px-3">
        <div class="flex space-x-2">
          <p class="text-skin-text">{{ $t('safeSnap.type') }}</p>
          <p v-if="type.includes('transferFunds')">
            {{ $t('safeSnap.transferFunds') }}
          </p>
          <p v-if="type.includes('contractInteraction')">
            {{ $t('safeSnap.contractInteraction') }}
          </p>
          <p v-if="type.includes('raw')">
            {{ $t('safeSnap.rawTransaction') }}
          </p>
          <p v-if="type.includes('transferNFT')">
            {{ $t('safeSnap.transferNFT') }}
          </p>
        </div>
      </div>
      <SafeSnapFormContractInteraction
        v-if="type === 'contractInteraction'"
        :config="config"
        :model-value="modelValue"
        :nonce="nonce"
        :is-details="isDetails"
        @update:modelValue="handleFormUpdate"
      />

      <SafeSnapFormTransferFunds
        v-if="type === 'transferFunds'"
        :config="config"
        :model-value="modelValue"
        :nonce="nonce"
        :is-details="isDetails"
        @update:modelValue="handleFormUpdate"
      />

      <SafeSnapFormSendAsset
        v-if="type === 'transferNFT'"
        :config="config"
        :model-value="modelValue"
        :nonce="nonce"
        :is-details="isDetails"
        @update:modelValue="handleFormUpdate"
      />

      <SafeSnapFormRawTransaction
        v-if="type === 'raw'"
        :model-value="modelValue"
        :nonce="nonce"
        :config="config"
        :is-details="isDetails"
        @update:modelValue="handleFormUpdate"
      />
    </div>

    <SafeSnapFormConnextTransaction
      v-if="transactionType === 'connext'"
      :model-value="connextModelValue"
      :config="config"
      :is-details="isDetails"
      :simulation-state="simulationState"
      @update:modelValue="handleFormUpdate"
    />
  </UiCollapsible>
</template>
<style lang="scss">
.transaction-container {
  border-radius: 16px;
  border: 1px solid #5f5f5f;
  background: rgba(255, 255, 255, 0.1);
}
</style>
