<template>
  <UiButton class="width-full mb-2">
    <input
      v-model="newEntry.to"
      v-on:input="handleAddressChanged"
      class="input width-full text-center"
      placeholder="Target address"
      required
    />
  </UiButton>
  <textarea
    class="input width-full textarea"
    v-model="newEntry.abi"
    v-on:input="handleABIChanged"
    placeholder="ABI"
  ></textarea>
  <UiButton class="width-full mb-2">
    <input
      v-model="newEntry.value"
      class="input width-full text-center"
      placeholder="Value"
      required
    />
  </UiButton>
  <div v-if="methods.length">
    <span>Methods</span>
    <UiButton class="width-full mb-2">
      <select v-model="methodIndex" class="input width-full text-center" required>
        <option
          v-for="(method, i) in methods"
          :key="i"
          :value="i"
        >
          {{ method.name }}
        </option>
      </select>
    </UiButton>
  </div>
  <UiButton @click="close" class="mb-2">Back</UiButton>
  <UiButton :disabled="!isValid" @click="handleSubmit" class="button--submit">
    Add
  </UiButton>
</template>

<script>
import Plugin from '@snapshot-labs/snapshot.js/src/plugins/daoModule';
import { parseEther } from '@ethersproject/units';
import { extractUsefulMethods, getContractABI } from '@/helpers/abi/utils';
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
  props: ['input', 'nonce', 'network'],
  emits: ['newTransaction', 'close'],
  data() {
    return {
      plugin: new Plugin(),
      newEntry: defaultEntry(),
      methods: [],
      methodIndex: 0,
      attributes: [],
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
  methods: {
    close() {
      this.$emit('close');
    },
    handleSubmit() {
      const transaction = toModuleTransaction(this.newEntry, this.nonce);
      this.$emit('newTransaction', transaction);
      this.$emit('close');
    },
    async handleAddressChanged() {
      const result = await getContractABI(this.network, this.newEntry.to);
      if (result) {
        this.newEntry.abi = result;
        this.handleABIChanged();
      }
    },
    handleABIChanged() {
      try {
        const abi = JSON.parse(this.newEntry.abi);
        this.methods = extractUsefulMethods(abi);
      } catch (error) {
        console.warn('error extracting useful methods', error);
      }
    }
  }
};
</script>

<style scoped lang="scss">
.textarea {
  border: 1px solid var(--border-color);
  background-color: transparent;
  color: var(--link-color);
  border-radius: 23px;
  padding: 0 24px;
  outline: none;
  font-size: 14px;

  &:hover {
    color: var(--link-color);
    border-color: var(--link-color);
  }
}
</style>
