<script setup lang="ts">
import { SafeImportTransaction, Network } from '../../types';
import { createSafeImportTransaction, parseValueInput } from '../../utils';
import MethodParameterInput from '../../components/Input/MethodParameter/MethodParameter.vue';
import AddressInput from '../../components/Input/Address.vue';
import { isAddress } from '@ethersproject/address';

const props = defineProps<{
  transaction: SafeImportTransaction;
  network: Network;
}>();

const emit = defineEmits<{
  updateTransaction: [transaction: SafeImportTransaction];
}>();

const isValueValid = ref(true);

const isToValid = computed(() => {
  if (!props.transaction?.to) {
    return true;
  }
  return isAddress(props.transaction.to);
});

function updateFinalTransaction(tx: Partial<SafeImportTransaction>) {
  const _tx = {
    ...props.transaction,
    ...tx
  };
  const formatted = createSafeImportTransaction(_tx);
  emit('updateTransaction', formatted);
}

function updateParams(paramsToUpdate: SafeImportTransaction['parameters']) {
  const _tx = {
    ...props.transaction,
    parameters: {
      ...props.transaction?.parameters,
      ...paramsToUpdate
    }
  };
  updateFinalTransaction(_tx);
}

function updateValue(newValue: string) {
  try {
    if (!props.transaction) {
      return;
    }
    const parsed = parseValueInput(newValue);
    updateFinalTransaction({
      value: parsed
    });
    isValueValid.value = true;
  } catch (error) {
    isValueValid.value = false;
  }
}
</script>

<template>
  <div class="text-skin-text text-left">
    {{
      props.transaction?.method?.name
        ? `Contract interaction (${props.transaction.method.name})`
        : 'Native Transfer'
    }}
  </div>

  <div v-if="props.transaction" class="flex flex-col gap-2 mt-2">
    <AddressInput
      @update:model-value="(e: string) => updateFinalTransaction({ to: e })"
      :model-value="props.transaction.to"
      :label="$t('safeSnap.to')"
      :error="!isToValid ? 'Invalid address' : undefined"
    />

    <UiInput
      placeholder="123456"
      :error="!isValueValid && 'Invalid value'"
      :model-value="props.transaction.value"
      @update:model-value="(e: string) => updateValue(e)"
    >
      <template #label>Value (wei)</template>
    </UiInput>

    <!-- ContractInteraction Parameters -->
    <div
      class="flex flex-col gap-2"
      v-if="props.transaction.method?.inputs?.length"
    >
      <div class="text-left mt-3">Function Parameters</div>
      <div class="divider h-[1px] bg-skin-border mb-3" />
      <MethodParameterInput
        v-for="input in props.transaction.method.inputs"
        :key="input.name"
        :validateOnMount="true"
        :parameter="input"
        :value="props.transaction?.parameters?.[input.name] ?? ''"
        @update-parameter-value="
          (e: string) => updateParams({ [input.name]: e })
        "
      />
    </div>
  </div>
</template>
