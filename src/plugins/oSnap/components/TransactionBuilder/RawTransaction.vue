<script setup lang="ts">
import { parseAmount } from '@/helpers/utils';
import { isAddress } from '@ethersproject/address';
import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import { isHexString } from '@ethersproject/bytes';
import { RawTransaction } from '../../types';
import { createRawTransaction, parseValueInput } from '../../utils';
import AddressInput from '../Input/Address.vue';

const props = defineProps<{
  transaction: RawTransaction;
  setTransactionAsInvalid(): void;
}>();

const emit = defineEmits<{
  updateTransaction: [transaction: RawTransaction];
}>();

const to = ref(props.transaction.to ?? '');
const value = ref(props.transaction.value ?? '0');
const data = ref(props.transaction.data ?? '0x');

const isValueValid = ref(true);

const isToValid = computed(() => {
  return to.value === '' || isAddress(to.value);
});

const isDataValid = computed(() => {
  return data.value === '' || isHexString(data.value);
});

watch(to, updateTransaction);
watch(value, updateTransaction);
watch(data, updateTransaction);

function updateTransaction() {
  try {
    if (!isToValid.value) {
      throw new Error('"To" address invalid');
    }
    if (!isValueValid.value) {
      throw new Error('"Value" amount invalid invalid');
    }
    if (!isDataValid.value) {
      throw new Error('"Data" field invalid');
    }

    const transaction = createRawTransaction({
      to: to.value,
      value: value.value,
      data: data.value
    });
    emit('updateTransaction', transaction);
  } catch (error) {
    console.error(error);
    props.setTransactionAsInvalid();
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
</script>

<template>
  <div class="space-y-2">
    <AddressInput
      v-model="to"
      :input-props="{ required: false }"
      :error="!isToValid && $t('safeSnap.invalidAddress')"
      :label="$t('safeSnap.to')"
    />

    <UiInput
      v-model="value"
      :error="!isValueValid && $t('safeSnap.invalidValue')"
      @update:model-value="updateValue($event)"
    >
      <template #label>{{ $t('safeSnap.value') }}</template>
    </UiInput>

    <UiInput v-model="data" :error="!isDataValid && $t('safeSnap.invalidData')">
      <template #label>{{ $t('safeSnap.data') }}</template>
    </UiInput>
  </div>
</template>
