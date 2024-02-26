<script lang="ts" setup>
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { coerceConfig, isValidInput, getSafeHash } from '../index';
import { getIpfsUrl } from '@/helpers/utils';
import SafeTransactions from './SafeTransactions.vue';
import SafeSnapsSafeSelect from './Select/SafeSelect.vue';
import { Network } from '../types';
import {
  ExtendedSpace,
  Proposal,
  Results,
  SafeDetails,
  SafeExecutionData
} from '@/helpers/interfaces';

type Config = {
  safes: {
    connextAddress?: string;
    network: Network;
    umaAddress?: string;
    realityAddress?: string;
  }[];
};

type Input = {
  safes: SafeDetails[];
  valid: boolean;
};

type ConfigProps = {
  modelValue?: any; // proposal's plugins.safeSnap field or undefined when creating a new proposal
  config: Config; // the safeSnap plugin config of the current space
  network: Network; // network of the space (needed when mapping legacy plugin configs)
  proposal: Proposal;
  preview: boolean; // if true, renders a read-only view
  space?: ExtendedSpace;
  results?: Results;
};

const props = defineProps<ConfigProps>();
const emits = defineEmits(['update:modelValue']);

const input = ref<Input>({
  safes: [],
  valid: true
});
const selectedSafes = ref<SafeDetails[]>([]);
const isButtonClicked = ref<boolean>(false);
const ipfs = computed(() => getIpfsUrl(props.proposal?.ipfs));
const safesToDisplay = computed(() => {
  return props.preview ? input.value.safes : selectedSafes.value;
});

watchEffect(() => {
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
    if (props.preview) {
      const value = clone(props.modelValue);
      if (value.safes && props.config && Array.isArray(props.config.safes)) {
        value.safes = value.safes.map(safe => {
          const configForNetwork = props.config.safes.find(
            config => config.network === safe.network
          );
          return {
            ...configForNetwork,
            ...safe
          };
        });
      }
      input.value = coerceConfig(value, props.network);
    }
  }
});

function convertToSafeExecutionData(
  safeDetail: SafeDetails
): SafeExecutionData {
  return {
    hash: safeDetail.hash,
    txs: safeDetail.txs,
    network: safeDetail.network,
    realityModule: safeDetail.realityModule || ''
    // add any filed needed for SafeExecutionData
  };
}

const updateSafeTransactions = () => {
  if (props.preview) return;

  // Converts each 'SafeDetails' to 'SafeExecutionData'
  const safeExecutionDataArray: SafeExecutionData[] = selectedSafes.value.map(
    safe => convertToSafeExecutionData(safe)
  );

  // Updates the hash for each 'SafeExecutionData'
  safeExecutionDataArray.forEach(safe => {
    safe.hash = getSafeHash(safe);
  });

  // Validates the converted safes
  const isValid = isValidInput({ safes: safeExecutionDataArray });
  // Emits the updated model
  emits('update:modelValue', {
    safes: safeExecutionDataArray,
    valid: isValid
  });
};

const handleButtonClick = () => {
  isButtonClicked.value = !isButtonClicked.value;
};

const handleSafeSelected = (selectedSafe: SafeDetails) => {
  const index = selectedSafes.value.findIndex(
    (safe: SafeDetails) =>
      safe.gnosisSafeAddress === selectedSafe.gnosisSafeAddress
  );

  if (index === -1) {
    selectedSafes.value.push(selectedSafe);
  } else {
    selectedSafes.value[index] = selectedSafe;
  }
  isButtonClicked.value = false;
  updateSafeTransactions();
};

const handleDeleteSafe = (safeToDelete: SafeDetails) => {
  const safes = clone(selectedSafes.value);
  const newSafeList = safes.filter(
    safe => safe.gnosisSafeAddress !== safeToDelete.gnosisSafeAddress
  );
  selectedSafes.value = newSafeList;
  updateSafeTransactions();
};
</script>

<template>
  <div v-if="!preview || safesToDisplay.length > 0">
    <div
      :class="[preview ? '' : 'px-4', 'block', 'pt-3']"
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
      v-for="(safe, index) in safesToDisplay"
      :key="index"
      class="mb-5 last:border-b-0"
    >
      <SafeTransactions
        :key="`${safe.gnosisSafeAddress}-${safe.network}`"
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
        @update:modelValue="updateSafeTransactions()"
        @delete:safe="handleDeleteSafe(safe)"
      />
    </div>
    <div class="my-3 ml-4" v-if="!preview">
      <TuneButton @click="handleButtonClick">Add a Safe</TuneButton>
      <SafeSnapsSafeSelect
        v-if="isButtonClicked"
        :safes="input.safes"
        @safe-selected="handleSafeSelected"
      />
    </div>
  </div>
</template>
