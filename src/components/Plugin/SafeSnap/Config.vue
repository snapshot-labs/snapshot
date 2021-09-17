<script>
import { clone } from '@/helpers/utils';

const isValidInput = input => {
  return input.safes.every(
    safe => safe.txs.length === 0 || safe.txs.flat().every(tx => tx)
  );
};

const coerceConfig = (config, network) => {
  if (config.safes) return config;

  // map legacy config to new format
  return {
    safes: [{ network, realityAddress: config.address }]
  };
};

export default {
  props: [
    'modelValue', // proposal's plugins.safeSnap field or undefined when creating a new proposal
    'config', // the safeSnap plugin config of the current space
    'network', // network of the space (needed when mapping legacy plugin configs)
    'proposal',
    'preview' // if true, renders a read-only view
  ],
  emits: ['update:modelValue'],
  data() {
    const initialValue = {
      safes: coerceConfig(this.config, this.network).safes.map(safe => ({
        ...safe,
        txs: []
      })),
      valid: true
    };
    return {
      input: this.modelValue ? clone(this.modelValue) : initialValue
    };
  },
  methods: {
    updateSafeTransactions(safeIndex, txs) {
      if (this.preview) return;
      this.input.safes[index].txs;
      this.input.valid = isValidInput(input);
      this.$emit('update:modelValue', this.input);
    }
  }
};
</script>

<template>
  <div v-for="(safe, index) in input.safes" v-bind:key="index">
    <PluginSafeSnapSafeTransactions
      v-if="!preview || safe.txs.length > 0"
      :preview="preview"
      :proposal="proposal"
      :network="safe.network"
      :realityAddress="safe.realityAddress"
      :modelValue="safe.txs"
      @update:modelValue="updateSafeTransactions(index, $event)"
    />
  </div>
</template>
