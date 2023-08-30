<script setup lang="ts">
import { getIpfsUrl } from '@/helpers/utils';
import { getSafeHash, isValidInput } from '../index';

import { ExtendedSpace, Proposal, Results } from '@/helpers/interfaces';
import SafeTransactions from './SafeTransactions.vue';

type Safe = {

}

const props = defineProps<{
  modelValue: any;
  proposal: Proposal
  space: ExtendedSpace
  preview: boolean;
  results: Results;
}>()

const emits = defineEmits(['update:modelValue'])

const input = ref({
  hash: null,
  txs: [],
  valid: true
})

const ipfs = getIpfsUrl(props.proposal.ipfs);
function updateSafeTransactions() {
      if (props.preview) return;
      input.value.valid = isValidInput(input.value);
      input.value.safes = input.value.safes.map(safe => {
        return {
          ...safe,
          hash: getSafeHash(safe)
        };
      });
      this.$emit('update:modelValue', this.input);
    }
</script>

<template>
  <div
    v-if="!preview || input.safes.length > 0"
    class="mb-4 rounded-none border-b border-t bg-skin-block-bg md:rounded-xl md:border"
  >
    <div
      class="block border-b px-4 pt-3"
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
        @update:modelValue="updateSafeTransactions()"
      />
    </div>
  </div>
</template>
