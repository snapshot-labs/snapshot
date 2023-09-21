<script setup lang="ts">
import { parseValue } from '@/helpers/utils';
import { isAddress } from '@ethersproject/address';
import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import { isHexString } from '@ethersproject/bytes';
import { createRawTransaction } from '../../index';
import { RawTransaction, Transaction } from '../../types';
import AddressInput from '../Input/Address.vue';

const props = defineProps<{
  preview: boolean;
  transaction: Transaction;
}>();

const emit = defineEmits<{
  updateTransaction: [transaction: RawTransaction];
}>();

const to = ref('');
const value = ref('0');
const data = ref('');

const isToValid = computed(() => {
  return to.value === '' || isAddress(to.value);
});

const isValueValid = computed(() => {
  if (value.value === '') return true;
  if (!isBigNumberish(value.value)) return false;
  try {
    parseValue(value.value);
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
  if (props.preview || !isToValid || !isValueValid.value || !isDataValid.value)
    return;

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
      :disabled="preview"
      :input-props="{ required: false }"
      :error="!isToValid && $t('safeSnap.invalidAddress')"
      :label="$t('safeSnap.to')"
    />

    <UiInput
      v-model="value"
      :disabled="preview"
      :error="!isValueValid && $t('safeSnap.invalidValue')"
    >
      <template #label>{{ $t('safeSnap.value') }}</template>
    </UiInput>

    <UiInput
      v-model="data"
      :disabled="preview"
      :error="!isDataValid && $t('safeSnap.invalidData')"
    >
      <template #label>{{ $t('safeSnap.data') }}</template>
    </UiInput>
  </div>
</template>

<style lang="scss" scoped>
.textarea {
  border: 1px solid var(--border-color);
  background-color: transparent;
  color: var(--link-color);
  border-radius: 23px;
  padding: 0 24px;
  outline: none;
  font-size: 14px;

  &:hover {
    color: var(--link-color);
    border-color: var(--link-color);
  }
}

.divider {
  border-top: 1px solid #cacaca;
  margin-top: 16px;
  margin-bottom: 24px;
}
</style>
