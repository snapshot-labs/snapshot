<script setup lang="ts">
import { SafeImportTransaction, Network } from '../../types';
import { createSafeImportTransaction, parseValueInput } from '../../utils';
import MethodParameterInput from '../../components/Input/MethodParameter.vue';
import AddressInput from '../../components/Input/Address.vue';
import { isAddress } from '@ethersproject/address';

const props = defineProps<{
  transaction: SafeImportTransaction;
  network: Network;
  setTransactionAsInvalid(): void;
}>();

const emit = defineEmits<{
  updateTransaction: [transaction: SafeImportTransaction];
}>();

const isValueValid = ref(true);
const finalTransaction = ref<SafeImportTransaction>(props.transaction); // decoded method, extracted args

const isToValid = computed(() => {
  if (!finalTransaction?.value?.to) {
    return true;
  }
  return isAddress(finalTransaction.value.to);
});

function updateFinalTransaction(tx: Partial<SafeImportTransaction>) {
  finalTransaction.value = {
    ...finalTransaction.value,
    ...tx
  } as SafeImportTransaction;
}

function updateParams(paramsToUpdate: SafeImportTransaction['parameters']) {
  finalTransaction.value = {
    ...finalTransaction.value,
    parameters: {
      ...finalTransaction.value?.parameters,
      ...paramsToUpdate
    }
  } as SafeImportTransaction;
}

function updateValue(newValue: string) {
  try {
    if (!finalTransaction.value) {
      return;
    }
    const parsed = parseValueInput(newValue);
    updateFinalTransaction({
      value: parsed
    });
    isValueValid.value = true;
  } catch (error) {
    isValueValid.value = false;
  } finally {
    updateTransaction();
  }
}

function updateTransaction() {
  try {
    if (!finalTransaction.value) {
      throw new Error('No Transaction selected');
    }

    if (!isValueValid.value) {
      throw new Error('"Value" field is invalid');
    }

    if (!isToValid.value) {
      throw new Error('"To" field is invalid');
    }

    const tx = createSafeImportTransaction(finalTransaction.value);
    console.log(tx);
    emit('updateTransaction', tx);
  } catch (error) {
    console.error(error);
    props.setTransactionAsInvalid();
  }
}

watch(finalTransaction, updateTransaction, { deep: true });
onMounted(updateTransaction);
</script>

<template>
  <div class="text-skin-text text-left">
    {{
      props.transaction?.method?.name
        ? `Contract interaction (${props.transaction.method.name})`
        : 'Native Transfer'
    }}
  </div>

  <div v-if="finalTransaction" class="flex flex-col gap-2 mt-2">
    <AddressInput
      @update:model-value="(e: string) => updateFinalTransaction({ to: e })"
      :model-value="finalTransaction.to"
      :label="$t('safeSnap.to')"
      :error="!isToValid ? 'Invalid address' : undefined"
    />

    <UiInput
      placeholder="123456"
      :error="!isValueValid && 'Invalid value'"
      :model-value="finalTransaction.value"
      @update:model-value="(e: string) => updateValue(e)"
    >
      <template #label>Value (wei)</template>
    </UiInput>

    <!-- ContractInteraction Parameters -->
    <div
      class="flex flex-col gap-2"
      v-if="finalTransaction.method?.inputs?.length"
    >
      <div class="text-left mt-3">Function Parameters</div>
      <div class="divider h-[1px] bg-skin-border mb-3" />
      <MethodParameterInput
        v-for="input in finalTransaction.method.inputs"
        :key="input.name"
        :validateOnMount="true"
        :parameter="input"
        :value="finalTransaction?.parameters?.[input.name] ?? ''"
        @update-parameter-value="
          (e: string) => updateParams({ [input.name]: e })
        "
      />
    </div>
  </div>
</template>
