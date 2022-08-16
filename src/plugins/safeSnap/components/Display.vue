<script setup lang="ts">
import { ref } from 'vue';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { coerceConfig } from '@/plugins/safeSnap/utils';

import DisplayTransactions from './DisplayTransactions.vue';

const props = defineProps([
  'modelValue', // proposal's plugins.safeSnap field or undefined when creating a new proposal
  'config', // the safeSnap plugin config of the current space
  'network', // network of the space (needed when mapping legacy plugin configs)
  'proposal'
]);

const input = ref<{
  safes: any[];
  valid?: boolean;
}>({ safes: [] });

if (!Object.keys(props.modelValue).length) {
  input.value = {
    safes: coerceConfig(props.config, props.network).safes.map(safe => ({
      ...safe,
      hash: null,
      txs: []
    })),
    valid: true
  };
} else {
  const value = clone(props.modelValue);
  if (value.safes && props.config && Array.isArray(props.config.safes)) {
    value.safes = value.safes.map((safe, index) => ({
      ...props.config.safes[index],
      ...safe
    }));
  }
  input.value = coerceConfig(value, props.network);
}
</script>

<template>
  <div
    class="mb-4 rounded-none border-t border-b bg-skin-block-bg md:rounded-xl md:border"
  >
    <h4 class="block border-b px-4 pt-3" style="padding-bottom: 12px">
      {{ $t('safeSnap.transactions') }}
    </h4>
    <div
      v-for="(safe, index) in input.safes"
      :key="index"
      class="border-b last:border-b-0"
    >
      <DisplayTransactions
        :proposal="proposal"
        :hash="safe.hash"
        :network="safe.network"
        :reality-address="safe.realityAddress"
        :multi-send-address="safe.multiSendAddress"
        :model-value="safe.txs"
      />
    </div>
  </div>
</template>
