<script>
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { coerceConfig, isValidInput, getSafeHash } from '../index';
import { getIpfsUrl } from '@/helpers/utils';

import SafeTransactions from './SafeTransactions.vue';

export default {
  components: { SafeTransactions },
  props: [
    'modelValue', // proposal's plugins.safeSnap field or undefined when creating a new proposal
    'config', // the safeSnap plugin config of the current space
    'network', // network of the space (needed when mapping legacy plugin configs)
    'proposal',
    'preview', // if true, renders a read-only view
    'space',
    'results'
  ],
  emits: ['update:modelValue'],
  data() {
    let input;
    if (!Object.keys(this.modelValue).length) {
      input = {
        safes: coerceConfig(this.config, this.network).safes.map(safe => ({
          ...safe,
          hash: null,
          txs: []
        })),
        valid: true
      };
    } else {
      const value = clone(this.modelValue);
      if (value.safes && this.config && Array.isArray(this.config.safes)) {
        value.safes = value.safes.map((safe, index) => ({
          ...this.config.safes[index],
          ...safe
        }));
      }
      input = coerceConfig(value, this.network);
    }

    return { input, ipfs: getIpfsUrl(this?.proposal?.ipfs) };
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
    class="bg-skin-block-bg rounded-xl border"
  >
    <div
      class="block px-3 pt-3"
      style="
        padding-bottom: 12px;
        display: flex;
        justify-content: space-between;
      "
    >
      <h4>
        {{ $t('safeSnap.transactions') }}
      </h4>
      <BaseLink v-if="ipfs" :link="ipfs"> View Details </BaseLink>
    </div>

    <div
      v-for="(safe, index) in input.safes"
      :key="index"
      class="border-b last:border-b-0"
    >
      <SafeTransactions
        v-if="!preview || safe.txs.length > 0"
        :preview="preview"
        :proposal="proposal"
        :space="space"
        :results="results"
        :hash="safe.hash"
        :network="safe.network"
        :reality-address="safe.realityAddress"
        :uma-address="safe.umaAddress"
        :multi-send-address="safe.multiSendAddress"
        :model-value="safe.txs"
        @update:model-value="updateSafeTransactions(index, $event)"
      />
    </div>
  </div>
</template>
