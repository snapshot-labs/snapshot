<script setup lang="ts">
// test contract: 0xd34b12893aE5B1CDDa846C430d0C01782aE496C3
import { computed, ref, watch } from 'vue';
import flattenDeep from 'lodash/flattenDeep';
import {
  encodeContractData,
  ParamValueError,
  ParamValue,
  Transaction,
  TransactionOperationType,
  decodeContractData,
  bigNumberValuesToString
} from '@/helpers/transactionBuilder';
import { getABIWriteFunctions, getContractABI } from '@/helpers/abi';
import { FunctionFragment, Interface } from '@ethersproject/abi';
import { BigNumber } from 'ethers';
import { isAddress } from '@ethersproject/address';
import { FormError } from '@/helpers/interfaces';

const props = defineProps<{
  showForm: boolean;
  transaction: Transaction | null;
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
const requiredParams = computed(() => selectedMethod.value?.inputs ?? []);
const paramValues = ref<ParamValue[]>([]);
const paramValueErrors = ref<ParamValueError[]>([]);

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

const contractAddressError = computed<FormError | null>(() => {
  if (contractAddress.value === '')
    return { message: 'Contract address is required' };
  if (!isAddress(contractAddress.value))
    return { message: 'Contract address is not valid' };
  return null;
});

const abiNotFoundError = computed<FormError | null>(() => {
  if (useCustomData.value) return null;

  if (abiNotFound.value)
    return {
      message: `ABI not found on network #${props.network}`,
      push: true
    };

  return null;
});

const abiParseError = computed<FormError | null>(() => {
  if (!useCustomData.value && !abi.value)
    return { message: 'ABI string invalid', push: true };

  return null;
});

const hasParamValueErrors = computed<boolean>(() =>
  flattenDeep(paramValueErrors.value).some(e => !!e)
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
  paramValues.value = [];
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
        paramValues.value
      ),
      operation: TransactionOperationType.CALL,
      abi: abiString.value
    });
  }

  closeAndClearForm();
}

function populateForm() {
  if (!props.showForm) return;

  if (props.transaction) {
    contractAddress.value = props.transaction.to;
    if (props.transaction.abi) {
      abiString.value = props.transaction.abi;
      useCustomData.value = false;
      const { method, values } = decodeContractData(
        props.transaction.data,
        props.transaction.abi
      );
      selectedMethod.value = method;
      paramValues.value = method.inputs.map((_, i) =>
        bigNumberValuesToString(values[i])
      );
    } else {
      useCustomData.value = true;
      value.value = props.transaction.value;
      data.value = props.transaction.data;
    }
  }
}

watch(() => props.showForm, populateForm);
watch(contractAddress, updateABI);
watch(abiString, updateMethods);
watch(selectedMethod, () => (paramValues.value = []));
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
              :error="(contractAddressError || abiNotFoundError) as FormError"
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
            <InputString
              v-model="abiString"
              :error="(abiParseError as FormError)"
            />
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

          <TransactionBuilderFormContractParams
            :params="requiredParams"
            :values="paramValues"
            @update-values="paramValues = $event"
            @update-errors="paramValueErrors = $event"
          />
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
          hasParamValueErrors
        "
        @click="saveTransaction"
      >
        save
      </BaseButton>
    </template>
  </BaseModal>
</template>
