<script>
import { formatUnits } from '@ethersproject/units';
import { getAbiFirstFunctionName } from '../../index';
import SafeSnapFormContractInteraction from './ContractInteraction.vue';
import SafeSnapFormTransferFunds from './TransferFunds.vue';
import SafeSnapFormSendAsset from './SendAsset.vue';
import SafeSnapFormRawTransaction from './RawTransaction.vue';
import SafeSnapFormConnextTransactionBuilder from './ConnextTransactionBuilder.vue';
import Plugin from '../../index';
import { shorten } from '@/helpers/utils';
import { decodeXCall } from '../../utils/encodeXCall';

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
    SafeSnapFormConnextTransactionBuilder
  },
  props: ['modelValue', 'nonce', 'config', 'isDetails', 'transactionType'],
  emits: ['update:modelValue', 'remove', 'edit'],
  data() {
    let type = 'transferFunds';
    if (this.modelValue) {
      type = this.modelValue.type ? this.modelValue.type : 'raw';
    }

    return {
      resolvedTitle: 'Transaction',
      transactionType: this.transactionType,
      open: !this.config.preview,
      type
    };
  },
  watch: {
    modelValue: {
      immediate: true,
      async handler(newVal, oldVal) {
        if (!newVal) return;

        if (newVal !== oldVal || (newVal && !oldVal)) {
          this.resolvedTitle = await this.computeTitle();
        }
        if (newVal.type) {
          this.type = this.modelValue.type;
        }
      }
    },
    transactionType(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.transactionType = newVal;
      }
    }
  },

  mounted() {
    if (!this.config || !this.modelValue) {
      return;
    }
    if (!this.config.preview) this.$emit('update:modelValue', undefined);
    if (!this.modelValue.type) {
      this.type = 'raw';
    }
  },
  methods: {
    async computeTitle() {
      if (!this.modelValue) {
        return this.getLabel(this.type);
      }
      if (this.type === 'connext') {
        const { originTx } = this.modelValue;
        const { to: zodiacConnextMod } = decodeXCall(originTx.data);

        return `Cross-chain to ${shorten(
          zodiacConnextMod ?? ''
        )} (Zodiac Connext Mod)`;
      }

      if (this.modelValue) {
        console.log('this.modelValue', this.modelValue);
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
          console.warning('could not determine title', error);
        }
      }

      return this.getLabel(this.type);
    },

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
      return parseInt(this.nonce) + 1;
    }
  }
};
</script>

<template>
  <UiCollapsible
    :hide-remove="config.preview"
    :number="showNonce()"
    :open="open"
    :title="resolvedTitle"
    :show-arrow="true"
    :show-edit="!config.preview"
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
        @update:model-value="handleTypeChange($event)"
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
        @update:model-value="handleFormUpdate"
      />

      <SafeSnapFormTransferFunds
        v-if="type === 'transferFunds'"
        :config="config"
        :model-value="modelValue"
        :nonce="nonce"
        :is-details="isDetails"
        @update:model-value="handleFormUpdate"
      />

      <SafeSnapFormSendAsset
        v-if="type === 'transferNFT'"
        :config="config"
        :model-value="modelValue"
        :nonce="nonce"
        :is-details="isDetails"
        @update:model-value="handleFormUpdate"
      />

      <SafeSnapFormRawTransaction
        v-if="type === 'raw'"
        :model-value="modelValue"
        :nonce="nonce"
        :config="config"
        :is-details="isDetails"
        @update:model-value="handleFormUpdate"
      />
    </div>
    <SafeSnapFormConnextTransactionBuilder
      v-if="transactionType === 'connext'"
      :is-details="isDetails"
      :model-value="modelValue"
      :config="config"
      :nonce="nonce"
      @update:modelValue="updateConnextTransaction"
    />
    <!-- @clear-params="clearConnextParams" -->
    <!-- <SafeSnapFormConnextTransaction
      v-if="transactionType === 'connext'"
      :model-value="connextModelValue"
      :config="config"
      :is-details="isDetails"
      @update:model-value="handleFormUpdate"
    /> -->
  </UiCollapsible>
</template>
<style lang="scss">
.transaction-container {
  border-radius: 16px;
  border: 1px solid #5f5f5f;
  background: rgba(255, 255, 255, 0.1);
}
</style>
