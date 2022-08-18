<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { ref } from 'vue';
import { coerceConfig, getSafeHash, isValidInput } from './utils';
import SafeTransactions from './components/SafeTransactions.vue';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: any;
  modelValue: any;
}>();

const emit = defineEmits(['update']);
const update = form => {
  emit('update', { key: 'safeSnap', form });
};

const input = ref<{
  safes: any[];
  valid?: boolean;
}>({ safes: [] });

if (!Object.keys(props.modelValue).length) {
  input.value = {
    safes: coerceConfig(
      props.space.plugins.safeSnap,
      props.space.network
    ).safes.map(safe => ({
      ...safe,
      hash: null,
      txs: []
    })),
    valid: true
  };
} else {
  const value = clone(props.modelValue);
  if (
    value.safes &&
    props.space.plugins.safeSnap &&
    Array.isArray(props.space.plugins.safeSnap.safes)
  ) {
    value.safes = value.safes.map((safe, index) => ({
      ...props.space.plugins.safeSnap.safes[index],
      ...safe
    }));
  }
  input.value = coerceConfig(value, props.space.network);
}

const updateSafeTransactions = () => {
  input.value.valid = isValidInput(input.value);
  input.value.safes = input.value.safes.map(safe => {
    return {
      ...safe,
      hash: getSafeHash(safe)
    };
  });
  update(input.value);
};
</script>

<template>
  <BaseBlock
    v-if="space.plugins.safeSnap"
    :title="$t('safeSnap.transactions')"
    slim
  >
    <SafeTransactions
      v-for="(safe, index) in input.safes"
      :key="index"
      :proposal="proposal"
      :hash="safe.hash"
      :network="safe.network"
      :reality-address="safe.realityAddress"
      :multi-send-address="safe.multiSendAddress"
      :model-value="safe.txs"
      @update:modelValue="updateSafeTransactions()"
    />
  </BaseBlock>
</template>
