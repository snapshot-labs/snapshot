<script setup lang="ts">
import { FunctionFragment } from '@ethersproject/abi';
import { isAddress } from '@ethersproject/address';
import { asyncComputed, useDebounceFn } from '@vueuse/core';

import { ContractInteractionTransaction, Network, Status } from '../../types';
import {
  checkIsContract,
  createContractInteractionTransaction,
  fetchImplementationAddress,
  getABIWriteFunctions,
  getContractABI,
  parseValueInput
} from '../../utils';
import AddressInput from '../Input/Address.vue';
import MethodParameterInput from '../Input/MethodParameter.vue';
import { sleep } from '@snapshot-labs/snapshot.js/src/utils';

const props = defineProps<{
  network: Network;
  transaction: ContractInteractionTransaction;
  setTransactionAsInvalid: () => void;
}>();

const emit = defineEmits<{
  updateTransaction: [transaction: ContractInteractionTransaction];
}>();

const to = ref('');

const isToContract = asyncComputed(() => {
  if (!isAddress(to.value)) {
    return true;
  }
  return checkIsContract(to.value, props.network);
}, true);

const isToValid = computed(() => {
  return to.value !== '' && isAddress(to.value);
});

const abi = ref('');
const abiFetchStatus = ref<Status>(Status.IDLE);
const implementationAddress = ref('');
const showAbiChoiceModal = ref(false);

const isAbiValid = ref(true);
const abiError = ref<string>();
const value = ref(props.transaction.value ?? '0');
const isValueValid = ref(true);
const methods = ref<FunctionFragment[]>([]);
const selectedMethodName = ref(props.transaction.methodName ?? '');
const selectedMethod = computed(
  () =>
    methods.value.find(method => method.name === selectedMethodName.value) ??
    methods.value[0]
);

const parameters = ref<string[]>([]);

function updateTransaction() {
  try {
    if (!isToValid.value) {
      throw new Error('"TO" address invalid');
    }
    if (!isAbiValid.value) {
      throw new Error('ABI invalid');
    }
    if (!isValueValid.value) {
      throw new Error('Value invalid');
    }
    // throws is method params are invalid
    const transaction = createContractInteractionTransaction({
      to: to.value,
      value: value.value,
      abi: abi.value,
      method: selectedMethod.value,
      parameters: parameters.value
    });
    emit('updateTransaction', transaction);
  } catch (error) {
    console.error(error);
    props.setTransactionAsInvalid();
  }
}

async function handleFail() {
  abiFetchStatus.value = Status.FAIL;
  await sleep(3000);
  if (abiFetchStatus.value === Status.FAIL) {
    abiFetchStatus.value = Status.IDLE;
  }
}

function updateParameter(index: number, value: string) {
  parameters.value[index] = value;
}

function updateMethod(methodName: string) {
  parameters.value = [];
  selectedMethodName.value = methodName;
}

function updateAbi(newAbi: string) {
  if (newAbi === abi.value) {
    return;
  }
  try {
    abi.value = newAbi;
    methods.value = getABIWriteFunctions(abi.value);
    isAbiValid.value = true;
    updateMethod(methods.value[0].name);
    parameters.value = [];
  } catch (error) {
    handleFail();
    abiError.value = 'Error extracting write methods.';
  }
}

const debouncedUpdateAddress = useDebounceFn(() => {
  if (isAddress(to.value)) {
    fetchABI();
  }
}, 300);

async function handleUseProxyAbi() {
  showAbiChoiceModal.value = false;
  try {
    const res = await getContractABI(props.network, to.value);
    if (!res) {
      throw new Error('Failed to fetch ABI.');
    }
    updateAbi(res);
    abiFetchStatus.value = Status.SUCCESS;
  } catch (error) {
    handleFail();
    console.error(error);
  }
}

async function handleUseImplementationAbi() {
  showAbiChoiceModal.value = false;
  try {
    if (!implementationAddress.value) {
      throw new Error('No Implementation address');
    }
    const res = await getContractABI(
      props.network,
      implementationAddress.value
    );
    if (!res) {
      throw new Error('Failed to fetch ABI.');
    }
    abiFetchStatus.value = Status.SUCCESS;
    updateAbi(res);
  } catch (error) {
    handleFail();
    console.error(error);
  }
}

async function fetchABI() {
  try {
    abiFetchStatus.value = Status.LOADING;
    if (!isToContract.value) {
      throw new Error('Address provided is not a contract on this network');
    }
    const res = await fetchImplementationAddress(to.value, props.network);
    if (!res) {
      handleUseProxyAbi();
      return;
    }
    // if proxy, let user decide which ABI we should fetch
    implementationAddress.value = res;
    showAbiChoiceModal.value = true;
  } catch (error) {
    handleFail();
    console.error(error);
  }
}

function updateValue(newValue: string) {
  try {
    const parsed = parseValueInput(newValue);
    value.value = parsed;
    isValueValid.value = true;
  } catch (error) {
    isValueValid.value = false;
  } finally {
    updateTransaction();
  }
}

watch(to, updateTransaction);
watch(abi, updateTransaction);
watch(selectedMethodName, updateTransaction);
watch(selectedMethod, updateTransaction);
watch(parameters, updateTransaction, { deep: true });

function handleDismissModal() {
  abiFetchStatus.value = Status.IDLE;
  showAbiChoiceModal.value = false;
}
</script>

<template>
  <div class="space-y-2">
    <AddressInput
      v-model="to"
      :label="$t('safeSnap.to')"
      :disabled="abiFetchStatus === Status.LOADING"
      :error="!isToContract ? 'Not Contract address' : undefined"
      :network="network"
      @update:model-value="debouncedUpdateAddress()"
    />

    <UiInput
      :error="!isValueValid && $t('safeSnap.invalidValue')"
      :model-value="value"
      @update:model-value="updateValue($event)"
    >
      <template #label>{{ $t('safeSnap.value') }}</template>
    </UiInput>

    <UiInput
      :disabled="abiFetchStatus === Status.LOADING"
      :error="!isAbiValid && (abiError ?? $t('safeSnap.invalidAbi'))"
      :model-value="abi"
      @update:model-value="updateAbi($event)"
    >
      <template #label>ABI</template>
    </UiInput>
    <div
      v-if="abiFetchStatus === Status.LOADING"
      class="flex items-center justify-start gap-2 p-2"
    >
      <LoadingSpinner />
      <p>Fetching ABI...</p>
    </div>

    <div
      v-if="abiFetchStatus === Status.FAIL"
      class="flex items-center justify-start gap-2 p-2 text-red"
    >
      <BaseIcon name="warning" class="text-inherit" />
      <p>Failed to fetch ABI</p>
    </div>

    <div v-if="methods.length">
      <UiSelect v-model="selectedMethodName" @change="updateMethod($event)">
        <template #label>function</template>
        <option v-for="(method, i) in methods" :key="i" :value="method.name">
          {{ method.name }}()
        </option>
      </UiSelect>

      <div
        v-if="selectedMethod && selectedMethod.inputs.length"
        class="flex flex-col gap-2"
      >
        <div class="divider h-[1px] bg-skin-border my-3" />

        <MethodParameterInput
          v-for="(input, index) in selectedMethod.inputs"
          :key="input.name"
          :parameter="input"
          :value="parameters[index]"
          @update-parameter-value="updateParameter(index, $event)"
        />
      </div>
    </div>
  </div>

  <BaseModal :open="showAbiChoiceModal" @close="handleDismissModal">
    <template #header>
      <h3 class="text-left px-3">Use Implementation ABI?</h3>
    </template>
    <div class="flex flex-col gap-4 p-3">
      <p class="pr-8">
        This contract looks like a proxy. Would you like to use the
        implementation ABI?
      </p>
      <div class="flex gap-2 justify-center">
        <TuneButton @click="handleUseProxyAbi"> Keep proxy ABI </TuneButton>
        <TuneButton @click="handleUseImplementationAbi">
          Use Implementation ABI
        </TuneButton>
      </div>
    </div>
  </BaseModal>
</template>
