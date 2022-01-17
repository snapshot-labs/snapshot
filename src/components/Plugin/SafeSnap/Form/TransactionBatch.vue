<script>
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { useSafesnap } from '@/composables/useSafesnap';
import chevronIcon from '@/assets/icons/chevron.svg';
import {
  createBatch,
  ERC20ContractABI,
  ERC721ContractABI,
  removeHexPrefix
} from '@/helpers/abi/utils';
import { formatEther } from '@ethersproject/units';
import { FunctionFragment, Interface } from '@ethersproject/abi';

export default {
  props: ['modelValue', 'nonce', 'config'],
  emits: ['update:modelValue', 'remove'],
  setup() {
    const { safesnap } = useSafesnap();
    return { safesnap, removeHexPrefix };
  },
  data() {
    return {
      open: true,
      hashHidden: false,
      jsonHidden: false,
      batch: this.modelValue,
      transactions: this.modelValue ? clone(this.modelValue.transactions) : [],
      chevronIcon
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
      this.transactions.push(undefined);
    },
    updateTransaction(index, transaction) {
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
      return createBatch(this.config.realityAddress, chainId, nonce, txs);
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
              abi = ERC20ContractABI;
              break;
            case 'transferNFT':
              abi = ERC721ContractABI;
              break;
            default:
              base.data = tx.data;
              break;
          }
        }

        if (abi) {
          const contractInterface = new Interface(abi);
          const func = FunctionFragment.from(contractInterface.fragments[0]);
          const params = contractInterface.decodeFunctionData(func, tx.data);
          return {
            ...base,
            method: func.format(),
            params: params.map(param => param.toString())
          };
        }
        return base;
      });
    }
  }
};
</script>

<template>
  <UiCollapsible
    borderless
    :hideRemove="config.preview"
    :number="nonce + 1"
    :open="open"
    :title="`${$t('safeSnap.batch')} (${transactions.length})`"
    @remove="$emit('remove')"
    @toggle="open = !open"
  >
    <div
      v-for="(transaction, index) in transactions"
      v-bind:key="index"
      class="mb-2"
    >
      <PluginSafeSnapFormTransaction
        :modelValue="transaction"
        :config="config"
        :nonce="index"
        @remove="removeTransaction(index)"
        @update:modelValue="updateTransaction(index, $event)"
      />
    </div>
    <UiCollapsibleText
      v-if="this.modelValue.hash"
      :showArrow="true"
      :open="!hashHidden"
      class="mt-2 collapsible-text"
      title="Batch Transaction Hash"
      @toggle="hashHidden = !hashHidden"
    >
      {{ removeHexPrefix(this.modelValue.hash) }}
    </UiCollapsibleText>
    <UiCollapsibleText
      v-if="this.modelValue.hash"
      :showArrow="true"
      :pre="true"
      :open="!jsonHidden"
      class="mt-2 collapsible-text"
      title="Batch Transaction JSON"
      @toggle="jsonHidden = !jsonHidden"
    >
      {{
        JSON.stringify(
          formatBatchJson(this.modelValue.transactions),
          null,
          '\t'
        )
      }}
    </UiCollapsibleText>
    <Block
      v-if="
        safesnap.batchError &&
        safesnap.batchError.message &&
        nonce === safesnap.batchError.num
      "
      class="mt-4"
      style="border-color: red !important"
    >
      <Icon name="warning" class="mr-2 !text-red" />
      <span class="!text-red"> Error: {{ safesnap.batchError.message }}</span>
    </Block>

    <UiButton class="mt-2" v-if="!config.preview" @click="addTransaction">
      {{ $t('safeSnap.addTransaction') }}
    </UiButton>
  </UiCollapsible>
</template>

<style scoped>
.collapsible-text {
  border-radius: 23px;
}
</style>
