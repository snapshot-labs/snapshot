<script setup lang="ts">
type ModalSingleTransactionProps = {
  open: boolean;
  standardModelValue: SafeTransaction;
  connextModelValue: SafeTransaction;
  nonce: number;
  config: SafeTransactionConfig;
};

type ModalSingleTransactionEmits = {
  (e: 'close', value: void): void;
  (e: 'update:modelValue', value: SafeTransaction): void;
  (e: 'update:connextModelValue', value: SafeTransaction): void;
};

type TransactionType = {
  key: string;
  value: 'standard' | 'connext';
};

import SafeSnapFormContractInteraction from '../Form/ContractInteraction.vue';
import SafeSnapFormTransferFunds from '../Form/TransferFunds.vue';
import SafeSnapFormSendAsset from '../Form/SendAsset.vue';
import SafeSnapFormRawTransaction from '../Form/RawTransaction.vue';
import SafeSnapFormConnextTransaction from '../Form/ConnextTransaction.vue';
import SafeSnapFormConnextTransactionBuilder from '../Form/ConnextTransactionBuilder.vue';
import SafeSnapSimulationTenderly from '../Simulation/Tenderly.vue';
import {
  CustomConnextTransaction,
  SafeTransaction,
  SafeTransactionConfig,
  SimulationState
} from '@/helpers/interfaces';

const props = defineProps<ModalSingleTransactionProps>();
const emit = defineEmits<ModalSingleTransactionEmits>();
const transactionTypeList: TransactionType[] = [
  { key: 'Standard', value: 'standard' },
  { key: 'Cross chain (via Connext)', value: 'connext' }
];

const transactionBatchTypeSelected = ref<'standard' | 'connext'>('standard');
const modelValueToSimulate = ref<CustomConnextTransaction>();
const currentStandardModelValue = ref<SafeTransaction>(
  props.standardModelValue
);
const currentConnextModelValue = ref<CustomConnextTransaction>(
  props.connextModelValue as CustomConnextTransaction
);
const transactionTypeSelected = ref<string>(
  props.standardModelValue && props.standardModelValue.type
    ? props.standardModelValue.type
    : 'transferFunds'
);
const runSimulation = ref<boolean>(false);
const showSimulation = ref<boolean>(false);

watch(
  () => props.standardModelValue,
  newVal => {
    currentStandardModelValue.value = newVal || {};
    transactionTypeSelected.value =
      newVal && newVal.type ? newVal.type : 'transferFunds';
  },
  { immediate: true }
);

watch(
  () => props.connextModelValue,
  newVal => {
    currentConnextModelValue.value = newVal as CustomConnextTransaction;
  },
  { immediate: true }
);

const handleBatchTypeSelection = (selection: 'standard' | 'connext') => {
  transactionBatchTypeSelected.value = selection;
};

const handleTransactionType = (type: string) => {
  transactionTypeSelected.value = type;
};

const updateTransaction = (modelValue: SafeTransaction) => {
  currentStandardModelValue.value = modelValue;
};

const updateConnextTransaction = (modelValue: CustomConnextTransaction) => {
  if (modelValue.simpleTransaction) {
    currentConnextModelValue.value = modelValue;
    return;
  }
  modelValueToSimulate.value = modelValue;
  currentConnextModelValue.value = modelValue;
};

const clearConnextParams = () => {
  modelValueToSimulate.value = undefined;
  currentConnextModelValue.value =
    props.connextModelValue as CustomConnextTransaction;
};

const submitTransaction = () => {
  if (transactionBatchTypeSelected.value === 'standard') {
    emit('update:modelValue', {
      ...currentStandardModelValue.value,
      transactionBatchType: transactionBatchTypeSelected.value
    });
  }
  if (transactionBatchTypeSelected.value === 'connext') {
    emit('update:modelValue', {
      ...currentConnextModelValue.value,
      transactionBatchType: transactionBatchTypeSelected.value
    });
    // emit('update:connextModelValue', currentConnextModelValue.value);
  }
  emit('close');
};

const handleSimulation = () => {
  runSimulation.value = true;
  showSimulation.value = true;
};

const handleSimulationResult = (state: SimulationState) => {
  const tx = { ...currentConnextModelValue.value };
  currentConnextModelValue.value = { ...tx, simulation: state };
  runSimulation.value = false;
};

const buttonStates = computed(() => {
  if (runSimulation.value) {
    return true;
  }

  switch (transactionBatchTypeSelected.value) {
    case 'connext':
      return !(
        currentConnextModelValue.value && currentConnextModelValue.value.type
      );
    case 'standard':
      return !(
        currentStandardModelValue.value && currentStandardModelValue.value.type
      );
    default:
      return false;
  }
});
</script>

<template>
  <BaseModal
    :open="props.open"
    @close="emit('close')"
    :max-height="'800'"
    class=""
  >
    <template #header>
      <h3>Add Single Transaction</h3>
    </template>
    <div class="mx-2 my-4 min-h-[339px] md:mx-4">
      <UiSelect
        :custom-styles="'safesnap-custom-select'"
        :model-value="transactionBatchTypeSelected"
        @update:modelValue="handleBatchTypeSelection($event)"
      >
        <!-- :disabled="!props.config.connextAddress ? true : false" -->
        <template #label>Transaction Type</template>
        <option
          v-for="{ key, value } in transactionTypeList"
          :key="key"
          :value="value"
        >
          {{ key }}
        </option>
      </UiSelect>
      <hr class="my-4 border-skin-border" />

      <div
        v-if="transactionBatchTypeSelected.includes('standard')"
        class="pb-3"
      >
        <UiSelect
          :custom-styles="'safesnap-custom-select'"
          :disabled="config.preview"
          :model-value="transactionTypeSelected"
          @update:modelValue="handleTransactionType($event)"
        >
          <template #label>{{ $t('safeSnap.type') }}</template>
          <option value="transferFunds">
            {{ $t('safeSnap.transferFunds') }}
          </option>
          <option value="transferNFT">{{ $t('safeSnap.transferNFT') }}</option>
          <option value="contractInteraction">
            {{ $t('safeSnap.contractInteraction') }}
          </option>
          <option value="raw">{{ $t('safeSnap.rawTransaction') }}</option>
        </UiSelect>

        <SafeSnapFormContractInteraction
          v-if="transactionTypeSelected === 'contractInteraction'"
          :config="config"
          :model-value="currentStandardModelValue"
          :nonce="nonce"
          @update:modelValue="updateTransaction($event)"
        />

        <SafeSnapFormTransferFunds
          v-if="transactionTypeSelected === 'transferFunds'"
          :config="config"
          :model-value="currentStandardModelValue"
          :nonce="nonce"
          @update:modelValue="updateTransaction($event)"
        />

        <SafeSnapFormSendAsset
          v-if="transactionTypeSelected === 'transferNFT'"
          :config="config"
          :model-value="currentStandardModelValue"
          :nonce="nonce"
          @update:modelValue="updateTransaction($event)"
        />

        <SafeSnapFormRawTransaction
          v-if="transactionTypeSelected === 'raw'"
          :model-value="currentStandardModelValue"
          :nonce="nonce"
          :config="config"
          @update:modelValue="updateTransaction($event)"
        />
      </div>

      <div v-if="transactionBatchTypeSelected.includes('connext')" class="pb-3">
        <SafeSnapFormConnextTransactionBuilder
          :is-details="false"
          :model-value="currentConnextModelValue"
          :config="config"
          :nonce="nonce"
          @update:modelValue="updateConnextTransaction"
          @clear-params="clearConnextParams"
        />
        <!-- <SafeSnapFormConnextTransaction
          :is-details="false"
          :model-value="currentConnextModelValue"
          :config="config"
          :nonce="nonce"
          @update:modelValue="updateConnextTransaction"
        /> -->
      </div>

      <hr class="my-4 border-skin-border" />
      <div class="flex justify-between">
        <BaseButton
          v-if="!config.preview"
          @click="submitTransaction"
          :disabled="buttonStates"
        >
          Add Transaction
        </BaseButton>
        <BaseButton
          v-if="
            !config.preview &&
            transactionBatchTypeSelected.includes('connext') &&
            modelValueToSimulate
          "
          :disabled="runSimulation"
          @click="handleSimulation"
        >
          Simulate
        </BaseButton>
      </div>

      <div v-if="showSimulation && transactionBatchTypeSelected === 'connext'">
        <hr class="my-4 border-skin-border" />
        <SafeSnapSimulationTenderly
          v-if="modelValueToSimulate"
          :config="config"
          :run-simulation="runSimulation"
          :model-value-to-simulate="modelValueToSimulate"
          @close="() => (showSimulation = false)"
          @update:simulation="handleSimulationResult"
        />
      </div>
    </div>
  </BaseModal>
</template>
