<script setup lang="ts">
import { parseAmount } from '@/helpers/utils';
import { isAddress } from '@ethersproject/address';
import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import { isHexString } from '@ethersproject/bytes';
import { RawTransaction } from '../../types';
import { createRawTransaction } from '../../utils';
import AddressInput from '../Input/Address.vue';

const props = defineProps<{
  transaction: RawTransaction;
}>();

const emit = defineEmits<{
  updateTransaction: [transaction: RawTransaction];
}>();

const to = ref(props.transaction.to ?? '');
const value = ref(props.transaction.value ?? '0');
const data = ref(props.transaction.data ?? '0x');

const isToValid = computed(() => {
  return to.value === '' || isAddress(to.value);
});

const isValueValid = computed(() => {
  if (value.value === '') return true;
  if (!isBigNumberish(value.value)) return false;
  try {
    parseAmount(value.value);
    return true;
  } catch (error) {
    return false;
  }
});

const isDataValid = computed(() => {
  return data.value === '' || isHexString(data.value);
});

watch(to, updateTransaction);
watch(value, updateTransaction);
watch(data, updateTransaction);

function updateTransaction() {
  if (!isToValid.value || !isValueValid.value || !isDataValid.value) return;

  const transaction = createRawTransaction({
    to: to.value,
    value: value.value,
    data: data.value
  });
  emit('updateTransaction', transaction);
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
    >
      <template #label>{{ $t('safeSnap.value') }}</template>
    </UiInput>

    <UiInput v-model="data" :error="!isDataValid && $t('safeSnap.invalidData')">
      <template #label>{{ $t('safeSnap.data') }}</template>
    </UiInput>
  </div>
</template>
