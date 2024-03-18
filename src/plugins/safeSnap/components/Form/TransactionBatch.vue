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
        @update:model-value="updateTransaction($event)"
        @on-close-modal="handleCloseModal()"
      />
    </div>

    <TuneButton v-if="!config.preview" class="mt-2" @click="addTransaction">
      {{ $t('safeSnap.addTransaction') }}
    </TuneButton>
  </UiCollapsible>
</template>

<style scoped>
.collapsible-text {
  border-radius: 23px;
}
</style>
