<script>
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import {
  coerceConfig,
  isValidInput,
  getSafeHash
} from '@/../snapshot-plugins/src/plugins/safeSnap';

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
        hash: null,
        txs: []
      })),
      valid: true
    };
    return {
      input: this.modelValue
        ? coerceConfig(clone(this.modelValue), this.network)
        : initialValue
    };
  },
  methods: {
    updateSafeTransactions() {
      if (this.preview) return;
      this.input.valid = isValidInput(this.input);
      this.input.safes = this.input.safes.map(safe => {
        return {
          ...safe,
          hash: getSafeHash(safe)
        };
      });
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
          :hash="safe.hash"
          :network="safe.network"
          :realityAddress="safe.realityAddress"
          :multiSendAddress="safe.multiSendAddress"
          :modelValue="safe.txs"
          @update:modelValue="updateSafeTransactions(index, $event)"
        />
      </div>
    </div>
  </div>
</template>
