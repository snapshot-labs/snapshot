<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  encodeContractData,
  FormError,
  Transaction,
  TransactionOperationType,
  validateBytesString,
  validateIntString
} from '@/helpers/transactionBuilder';
import { getABIWriteFunctions, getContractABI } from '@/helpers/abi';
import { FunctionFragment, Interface } from '@ethersproject/abi';
import { BigNumber } from 'ethers';
import { isAddress } from '@ethersproject/address';

const props = defineProps<{
  showForm: boolean;
  transaction: Transaction | null;
  defaultFromAddress: string;
  network: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saveTransaction', transaction: Transaction): void;
}>();

const contractAddress = ref<string>('');
const abiString = ref<string>('[]');
const abi = computed<Interface | undefined>(() => {
  try {
    return new Interface(abiString.value);
  } catch (e) {
    return undefined;
  }
});
const availableMethods = computed<FunctionFragment[]>(() => {
  if (!abi.value) return [];
  return getABIWriteFunctions(abi.value);
});
const selectedMethod = ref<FunctionFragment | undefined>(undefined);
const methodParamValues = ref<(boolean | string | BigNumber)[]>([]);

const useCustomData = ref<boolean>(false);
const value = ref<BigNumber>(BigNumber.from(0));
const data = ref<string>('0x');

const abiLoading = ref(false);
const abiNotFound = ref(false);

const methodDropdownOptions = computed(() =>
  availableMethods.value.map(method => ({
    value: method,
    extras: method
  }))
);

const contractAddressError = computed<FormError>(() => {
  if (contractAddress.value === '')
    return { message: 'Contract address is required' };
  if (!isAddress(contractAddress.value))
    return { message: 'Contract address is not valid' };
  return undefined;
});

const abiNotFoundError = computed<FormError>(() => {
  if (useCustomData.value) return undefined;

  if (abiNotFound.value)
    return {
      message: `ABI not found on network #${props.network}`,
      push: true
    };

  return undefined;
});

const abiParseError = computed<FormError>(() => {
  if (!useCustomData.value && !abi.value)
    return { message: 'ABI string invalid', push: true };

  return undefined;
});

const paramErrors = computed<FormError[]>(() => {
  if (useCustomData.value || !selectedMethod.value) return [];

  return selectedMethod.value.inputs.map((param, index) => {
    const value = methodParamValues.value[index];
    if (value === undefined) return undefined;

    if (param.baseType.startsWith('bytes'))
      return validateBytesString(value as string, param.baseType);

    if (param.baseType.startsWith('int') || param.baseType.startsWith('uint'))
      return validateIntString(value as string, param.baseType);

    if (param.baseType === 'address') {
      if (!isAddress(value as string))
        return { message: 'Address is not valid' };
    }

    return undefined;
  });
});

const hasParamErrors = computed<boolean>(() =>
  paramErrors.value.some(error => !!error)
);

async function updateABI() {
  abiLoading.value = true;

  const newAbi = await getContractABI(props.network, contractAddress.value);

  if (newAbi) {
    abiNotFound.value = false;
    abiString.value = newAbi;
  } else {
    abiNotFound.value = true;
  }

  abiLoading.value = false;
}

function updateMethods() {
  if (!abiString.value) return;

  selectedMethod.value =
    availableMethods.value.find(
      method => method.name === selectedMethod.value?.name
    ) || availableMethods.value[0];
}

function closeAndClearForm() {
  emit('close');

  contractAddress.value = '';
  selectedMethod.value = undefined;
  methodParamValues.value = [];
  abiString.value = '[]';
  value.value = BigNumber.from(0);
  data.value = '0x';
}

function saveTransaction() {
  if (!selectedMethod.value && !useCustomData.value) return;

  if (useCustomData.value) {
    emit('saveTransaction', {
      to: contractAddress.value,
      value: value.value,
      data: data.value,
      operation: TransactionOperationType.CALL
    });
  } else if (selectedMethod.value) {
    emit('saveTransaction', {
      to: contractAddress.value,
      value: BigNumber.from(0),
      data: encodeContractData(
        abiString.value,
        selectedMethod.value,
        methodParamValues.value
      ),
      operation: TransactionOperationType.CALL
    });
  }

  closeAndClearForm();
}

async function populateForm() {
  if (!props.showForm) return;

  if (props.transaction) {
    contractAddress.value = props.transaction.to;
    value.value = props.transaction.value;
    data.value = props.transaction.data;
    useCustomData.value = data.value !== '0x';
  }
}

watch(() => props.showForm, populateForm);
watch(contractAddress, updateABI);
watch(abiString, updateMethods);
watch(selectedMethod, () => (methodParamValues.value = []));
</script>

<template>
  <BaseModal :open="showForm" @close="closeAndClearForm">
    <template #header>
      <h3>Custom contract interaction</h3>
    </template>

    <BaseContainer class="py-4">
      <div class="space-y-2">
        <div>
          <LabelInput>Contract address</LabelInput>
          <div class="relative mb-2">
            <LoadingSpinner
              v-if="abiLoading"
              class="absolute right-3 top-2 z-50"
            />
            <InputString
              v-model="contractAddress"
              placeholder="0x..."
              :error="contractAddressError || abiNotFoundError"
            />
          </div>
          <InputSwitch v-model="useCustomData" text-right="Use custom data" />
        </div>

        <template v-if="useCustomData">
          <div>
            <LabelInput>Value</LabelInput>
            <InputNumber
              :model-value="value.toString()"
              @update:model-value="value = BigNumber.from($event || 0)"
            />
          </div>
          <div>
            <LabelInput>Data</LabelInput>
            <InputString v-model="data" />
          </div>
        </template>

        <template v-else>
          <div>
            <LabelInput>ABI</LabelInput>
            <InputString v-model="abiString" :error="abiParseError" />
          </div>

          <BaseListbox
            v-if="availableMethods.length"
            v-model="selectedMethod"
            :items="methodDropdownOptions"
            label="Method"
          >
            <template #selected="{ selectedItem }">
              {{ selectedItem.extras?.name }}
            </template>
            <template #item="{ item }">
              {{ item.extras?.name }}
            </template>
          </BaseListbox>

          <div
            v-for="(param, index) in selectedMethod?.inputs"
            :key="index + param.type"
          >
            <TransactionBuilderFormContractParamBool
              v-if="param.baseType === 'bool'"
              :model-value="(methodParamValues[index] as boolean)"
              :label="param.name"
              @update:model-value="methodParamValues[index] = $event"
            />
            <TransactionBuilderFormContractParamBytes
              v-if="param.baseType.startsWith('bytes')"
              :model-value="(methodParamValues[index] as string)"
              :label="param.name"
              :error="paramErrors[index]"
              @update:model-value="methodParamValues[index] = $event"
            />
            <template v-if="param.baseType === 'string'">
              <LabelInput>{{ param.name }}</LabelInput>
              <InputString
                :model-value="(methodParamValues[index] as string)"
                @update:model-value="methodParamValues[index] = $event"
              />
            </template>
            <TransactionBuilderFormContractParamInt
              v-if="
                param.baseType.startsWith('uint') ||
                param.baseType.startsWith('int')
              "
              :model-value="(methodParamValues[index] as string)"
              :label="param.name"
              :error="paramErrors[index]"
              @update:model-value="methodParamValues[index] = $event"
            />
            <TransactionBuilderFormContractParamAddress
              v-if="param.baseType === 'address'"
              :model-value="(methodParamValues[index] as string)"
              :label="param.name"
              :error="paramErrors[index]"
              @update:model-value="methodParamValues[index] = $event"
            />
          </div>
        </template>
      </div>
    </BaseContainer>

    <template #footer>
      <BaseButton
        class="w-full"
        primary
        :disabled="
          !!contractAddressError ||
          !!abiParseError ||
          !!abiNotFoundError ||
          hasParamErrors
        "
        @click="saveTransaction"
      >
        save
      </BaseButton>
    </template>
  </BaseModal>
</template>
