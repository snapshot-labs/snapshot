<template>
  <form @submit.prevent="handleSubmit">
    <div class="mb-2 text-center">
      <h4 class="mb-3">Transactions</h4>
      <div v-if="adding">
        <UiButton class="width-full mb-2">
          <input
            v-model="newEntry.to"
            class="input width-full text-center"
            placeholder="Target address"
            required
          />
        </UiButton>
        <UiButton class="width-full mb-2">
          <input
            v-model="newEntry.value"
            class="input width-full text-center"
            placeholder="Value"
            required
          />
        </UiButton>
        <UiButton class="width-full mb-2">
          <input
            v-model="newEntry.data"
            class="input width-full text-center"
            placeholder="Data"
            required
          />
        </UiButton>
        <UiButton class="width-full mb-2">
          <select
            v-model="newEntry.operation"
            class="input width-full text-center"
            required
          >
            <option v-bind:value="'0'" selected="selected">Call</option>
            <option v-bind:value="'1'">Delegatecall</option>
          </select>
        </UiButton>
        <UiButton @click="adding = false" class="mb-2">
          Back
        </UiButton>
        <UiButton :disabled="!isValid" @click="addTx" class="button--submit">
          Add
        </UiButton>
      </div>
      <div v-else>
        <div
          v-for="(tx, i) in input.txs"
          :key="i"
          class="mb-3 p-4 border rounded-2 text-white text-center"
        >
          <PluginDaoModuleTransactionPreview :transaction="tx" />
          <UiButton v-if="input" @click="removeTx(i)" class="width-full mb-2">
            Remove
          </UiButton>
        </div>
        <UiButton @click="adding = true" class="width-full mb-2">
          Add
        </UiButton>
        <UiButton @click="handleSubmit" class="button--submit width-full">
          Confirm
        </UiButton>
      </div>
    </div>
  </form>
</template>

<script>
import Plugin from '@snapshot-labs/snapshot.js/src/plugins/daoModule';
import { parseEther } from '@ethersproject/units';
const defaultEntry = () => {
  return {
    operation: '0'
  };
};
const parseValueInput = input => {
  try {
    return parseEther(input).toString();
  } catch (e) {
    return input;
  }
};
const toModuleTransaction = (tx, nonce) => {
  return {
    nonce,
    to: tx.to,
    value: parseValueInput(tx.value),
    data: tx.data,
    operation: tx.operation
  };
};
export default {
  props: ['modelValue', 'proposal', 'network'],
  emits: ['update:modelValue', 'close'],
  data() {
    return {
      input: false,
      adding: false,
      plugin: new Plugin(),
      newEntry: defaultEntry()
    };
  },
  computed: {
    isValid() {
      // We validate with nonce 0 here and use the correct index as nonce later
      return this.plugin.validateTransaction(
        toModuleTransaction(this.newEntry, 0)
      );
    }
  },
  mounted() {
    if (this.modelValue) return (this.input = this.modelValue);
  },
  methods: {
    addTx() {
      if (!this.input) this.input = { txs: [] };
      // Nonce corresponds to the index, which is the current length of the txs array
      this.input.txs.push(
        toModuleTransaction(this.newEntry, this.input.txs.length)
      );
      this.newEntry = defaultEntry();
      this.adding = false;
    },
    removeTx(index) {
      if (!this.input || !this.input.txs || this.input.txs.length <= index)
        return;
      this.input.txs.splice(index, 1);
      // After removing an tx we need to correct the nonces
      this.input.txs.forEach((tx, index) => {
        tx.nonce = index;
      });
      if (this.input.txs.length == 0) {
        this.input = false;
      }
    },
    addAction() {
      if (!this.input) this.input = {};
      this.input = {
        txs: []
      };
    },
    removeAction() {
      this.input = false;
    },
    handleSubmit() {
      this.$emit('update:modelValue', this.input);
      this.$emit('close');
    }
  }
};
</script>
