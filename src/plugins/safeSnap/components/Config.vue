<script>
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { coerceConfig, isValidInput, getSafeHash } from '../index';
import { getIpfsUrl } from '@/helpers/utils';

import SafeTransactions from './SafeTransactions.vue';

import SafeSnapsSafeSelect from './Select/SafeSelect.vue';

export default {
  components: { SafeTransactions, SafeSnapsSafeSelect },
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

    return {
      input,
      ipfs: getIpfsUrl(this?.proposal?.ipfs),
      isButtonClicked: false,
      safes: []
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
    },
    handleButtonClick() {
      this.isButtonClicked = !this.isButtonClicked;
    },
    handleSafeSelected(safe) {
      this.isButtonClicked = false;
      if (!this.safes.length) {
        return (this.safes = [safe]);
      }
      const exists = this.safes.some(
        existingSafe => existingSafe.gnosisAddress === safe.gnosisAddress
      );
      if (!exists) {
        this.safes.push(safe);
      }
    },
    handleDeleteSafe(safe) {
      const { gnosisAddress } = safe;
      this.safes = this.safes.filter(
        safe => safe.gnosisAddress !== gnosisAddress
      );
    }
  }
};
</script>

<template>
  <div v-if="!preview || input.safes.length > 0">
    <div
      class="block px-4 pt-3"
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

    <!--TODO: FILTER SAFES OR INPUTS.SAFES-->
    <div v-for="(safe, index) in safes" :key="index" class="last:border-b-0">
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
        :connext-address="safe.connextAddress"
        :multi-send-address="safe.multiSendAddress"
        :gnosis-safe-address="safe.gnosisSafeAddress"
        :model-value="safe.txs"
        @update:modelValue="updateSafeTransactions(index, $event)"
        @delete:safe="handleDeleteSafe(safe)"
      />
    </div>
    <div class="my-3 ml-4" v-if="!preview">
      <BaseButton @click="handleButtonClick">Add a Safe</BaseButton>
      <SafeSnapsSafeSelect
        v-if="isButtonClicked"
        :safes="input.safes"
        @safeSelected="handleSafeSelected"
      />
    </div>
  </div>
</template>
