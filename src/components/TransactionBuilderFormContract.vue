<script setup lang="ts">
import { computed, inject, onMounted, ref, watch, watchEffect } from 'vue';
import { ContractTransaction } from '@/helpers/transactionBuilder';
import { getABIWriteFunctions, getContractABI } from '@/helpers/abi';
import { FunctionFragment, ParamType } from '@ethersproject/abi';

const props = defineProps<{
  transaction: ContractTransaction;
}>();

const emit = defineEmits<{
  (e: 'updateTransaction', transaction: ContractTransaction): void;
}>();

const network = inject('network') as string;

const contractAddressInput = ref<string>(props.transaction.contractAddress);
const methodInput = ref<string>(props.transaction.method);
const paramsInput = ref<string[]>([...props.transaction.params]);
const abiInput = ref<string>(props.transaction.abi);

const abiNotFound = ref(false);
const methods = ref<FunctionFragment[]>([]);
const params = ref<ParamType[]>([]);

const methodOptions = computed(() =>
  methods.value.map(method => ({
    value: method.name,
    extras: method
  }))
);

async function updateABI() {
  const newAbi = await getContractABI(network, contractAddressInput.value);
  if (newAbi) {
    abiNotFound.value = false;
    abiInput.value = newAbi;
  } else {
    abiNotFound.value = true;
  }
}

function updateMethods() {
  if (!abiInput.value) return;

  methods.value = getABIWriteFunctions(abiInput.value);
  methodInput.value =
    methods.value.find(method => method.name === methodInput.value)?.name ||
    methods.value[0]?.name;
}

function updateParams() {
  const method = methods.value.find(
    method => method.name === methodInput.value
  );
  if (method) {
    params.value = method.inputs;
  } else {
    params.value = [];
  }
}

onMounted(() => {
  updateMethods();
  updateParams();
});

watch(contractAddressInput, updateABI);
watch(abiInput, updateMethods);
watch(methodInput, updateParams);

watchEffect(() => {
  emit('updateTransaction', {
    contractAddress: contractAddressInput.value,
    method: methodInput.value,
    params: paramsInput.value,
    abi: abiInput.value
  });
});
</script>

<template>
  <div class="space-y-2">
    <div>
      <LabelInput>Contract address</LabelInput>
      <InputString
        v-model="contractAddressInput"
        placeholder="0x..."
        :error="
          contractAddressInput && abiNotFound
            ? {
                message: `No ABI found on network #${network}. Enter manually.`
              }
            : undefined
        "
      />
    </div>

    <div>
      <LabelInput>ABI</LabelInput>
      <InputString v-model="abiInput" />
    </div>

    <BaseListbox
      v-if="methods.length"
      v-model="methodInput"
      :items="methodOptions"
      label="Method"
    >
      <template #selected="{ selectedItem }">
        {{ selectedItem.extras?.name }}
      </template>
      <template #item="{ item }">
        {{ item.extras?.name }}
      </template>
    </BaseListbox>

    <div v-for="(param, index) in params" :key="index + param.type">
      <LabelInput>{{ param.name }}</LabelInput>
      <InputString v-model="paramsInput[index]" />
    </div>
  </div>
</template>
