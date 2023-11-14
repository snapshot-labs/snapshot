<script>
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { createBatch, ERC20_ABI, ERC721_ABI } from '../../index';
import { formatEther } from '@ethersproject/units';
import { FunctionFragment, Interface } from '@ethersproject/abi';
import SafeSnapFormTransaction from './Transaction.vue';
import SafeSnapFormImportTransactions from './ImportTransactions.vue';
import SafeSnapFormTransactionBatchItem from './TransactionBatchItem.vue';

export default {
  components: {
    SafeSnapFormTransaction,
    SafeSnapFormImportTransactions,
    SafeSnapFormTransactionBatchItem
  },
  props: ['modelValue', 'nonce', 'config', 'network'],
  emits: ['update:modelValue', 'remove', 'import'],
  setup() {
    const { safesnap } = useSafe();
    return { safesnap };
  },
  data() {
    return {
      batchTypeList: [
        { key: 'Standard', value: 'standard' },
        { key: 'JSON', value: 'json' }
      ],
      batchTypeSelected: 'standard',
      showSingleTransactionModal: false,
      open: true,
      hashHidden: true,
      jsonHidden: true,
      batch: this.modelValue,
      transactions: this.modelValue ? clone(this.modelValue.transactions) : []
    };
  },
  async mounted() {
    if (!this.config.preview && !this.transactions.length) {
      // Add transaction if batch is empty
      this.addTransaction();
    }
  },
  methods: {
    addTransaction() {
      // this.transactions.push(undefined);
      this.showSingleTransactionModal = true;
    },
    updateTransaction(payload) {
      const { index, transaction } = payload;
      if (this.config.preview) return;
      this.transactions[index] = transaction;
      this.updateBatch(this.transactions);
    },
    removeTransaction(index) {
      this.transactions.splice(index, 1);
      this.updateBatch(this.transactions);
      if (!this.transactions.length) {
        this.$emit('remove');
      }
    },
    updateBatch(txs) {
      const batch = this.createBatch(this.nonce, txs);
      this.$emit('update:modelValue', batch);
    },
    createBatch(nonce, txs) {
      const chainId = parseInt(this.config.network);
      return createBatch(
        this.config.realityAddress,
        chainId,
        nonce,
        txs,
        this.config.multiSendAddress
      );
    },
    formatBatchJson(txs) {
      const valid = txs.every(tx => tx);
      if (!valid) {
        return null;
      }
      return txs.map(tx => {
        const base = {
          to: tx.to,
          operation: tx.operation,
          value: formatEther(tx.value)
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
          const signHash = tx.data.substr(0, 10);
          const contractInterface = new Interface(abi);
          const functionFragment = contractInterface.fragments
            .filter(frag => FunctionFragment.isFunctionFragment(frag))
            .find(frag => contractInterface.getSighash(frag) === signHash);
          const func = FunctionFragment.from(functionFragment);
          const params = contractInterface.decodeFunctionData(func, tx.data);
          return {
            ...base,
            method: func.format(),
            params: params.map(param => param.toString())
          };
        }
        return base;
      });
    },
    handleBatchTypeSelection(selection) {
      this.batchTypeSelected = selection;
    },
    handleTxs(txs) {
      this.$emit('import', txs);
    },
    handleCloseModal() {
      this.showSingleTransactionModal = false;
    }
  }
};
</script>

<template>
  <UiCollapsible
    borderless
    :hide-remove="config.preview"
    :number="nonce + 1"
    :open="open"
    :showArrow="true"
    :title="`${$t('safeSnap.batch')} (${transactions.length})`"
    @remove="$emit('remove')"
    @toggle="open = !open"
  >
    <div>
      <SafeSnapFormTransactionBatchItem
        :transactions="transactions"
        :config="config"
        :show-single-transaction-modal="showSingleTransactionModal"
        @remove="removeTransaction($event)"
        @update:modelValue="updateTransaction($event)"
        @on-close-modal="handleCloseModal()"
      />
    </div>

    <BaseButton v-if="!config.preview" class="mt-2" @click="addTransaction">
      Add Single Transaction
    </BaseButton>
  </UiCollapsible>
</template>

<style scoped>
.collapsible-text {
  border-radius: 23px;
}
</style>

<!-- <UiSelect
      :model-value="batchTypeSelected"
      @update:modelValue="handleBatchTypeSelection($event)"
    >
      <template #label>Batch Type</template>
      <option v-for="{ key, value } in batchTypeList" :key="key" :value="value">
        {{ key }}
      </option>
    </UiSelect> -->

<!-- <SafeSnapFormImportTransactions
      v-if="batchTypeSelected.includes('json')"
      :network="network"
      @import="handleTxs"
    /> -->

<!-- <div class="p-3 mt-3 rounded-xl bg-skin-block-bg"> -->

<!-- <div
          v-for="(transaction, index) in transactions"
          :key="index"
          class="mb-2"
        >
          <SafeSnapFormTransaction
            :model-value="transaction"
            :config="config"
            :nonce="index"
            @remove="removeTransaction(index)"
            @update:modelValue="updateTransaction(index, $event)"
          />
        </div> -->
<!-- </div> -->
<!-- <UiCollapsibleText
        v-if="modelValue.hash"
        :show-arrow="true"
        :open="!hashHidden"
        :text="modelValue.hash"
        class="collapsible-text mt-2"
        title="Batch Transaction Hash"
        @toggle="hashHidden = !hashHidden"
      />
      <UiCollapsibleText
        v-if="modelValue.hash"
        :show-arrow="true"
        :open="!jsonHidden"
        :text="
          JSON.stringify(formatBatchJson(modelValue.transactions), null, '\t')
        "
        class="collapsible-text mt-2"
        title="Batch Transaction JSON"
        pre
        @toggle="jsonHidden = !jsonHidden"
      />
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
      </BaseBlock> -->
