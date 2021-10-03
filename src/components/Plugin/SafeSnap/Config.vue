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
      this.input.safes[safeIndex].txs;
      this.input.valid = isValidInput(this.input);
      this.$emit('update:modelValue', this.input);
    }
  }
};
</script>

<template>
  <div
    v-if="!preview || input.safes.length > 0"
    class="border-t border-b md:border rounded-none md:rounded-md mb-4 block-bg"
  >
    <h4
      class="px-4 pt-3 border-b block header-bg rounded-t-none md:rounded-t-md"
      style="padding-bottom: 12px"
    >
      {{ $t('safeSnap.transactions') }}
    </h4>
    <div class="p-4">
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
    </div>
  </div>
</template>
