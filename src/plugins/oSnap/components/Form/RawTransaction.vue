<script setup lang="ts">
import { parseValue } from '@/helpers/utils';
import { isHexString } from '@ethersproject/bytes';
import { decodeTransactionData, validateTransaction } from '../../index';
import { Network } from '../../types';
import AddressInput from '../Input/Address.vue';

const props = defineProps<{
  modelValue:
    | {
        to?: string;
        value?: string;
        data?: string;
      }
    | undefined;
  nonce: string;
  preview: boolean;
  network: Network;
}>();

const emit = defineEmits(['update:modelValue']);

const to = ref('');
const value = ref('0');
const data = ref('');

const isValueValid = computed(() => {
  if (!value.value.length) return true;
  try {
    parseValue(value.value);
    return true;
  } catch (error) {
    return false;
  }
});

const isDataValid = computed(() => {
  return !data.value.length || isHexString(data.value);
});

watch(to, updateTransaction);
watch(value, updateTransaction);
watch(data, updateTransaction);

function updateTransaction() {
  if (props.preview || !isValueValid.value || !isDataValid.value) return;

  try {
    const transaction = {
      value: value.value,
      to: to.value,
      data: data.value,
      nonce: props.nonce
    };

    if (validateTransaction(transaction)) {
      emit('update:modelValue', transaction);
      return;
    }
  } catch (error) {
    console.warn('invalid transaction', error);
  }

  onMounted(async () => {
    if (props.modelValue) {
      to.value = props.modelValue.to ?? '';
      value.value = props.modelValue.value ?? '0';
      data.value = props.modelValue.data ?? '';
    }

    if (
      props.preview &&
      props.modelValue?.to &&
      props.modelValue?.data &&
      props.modelValue?.value
    ) {
      try {
        const transaction = await decodeTransactionData(props.network, {
          to: props.modelValue.to,
          data: props.modelValue.data,
          value: props.modelValue.value,
          nonce: props.nonce
        });
        if (validateTransaction(transaction)) {
          emit('update:modelValue', transaction);
        }
      } catch (e) {
        console.warn('raw-transaction: failed to decode transaction');
      }
    }
  });
}
</script>

<template>
  <div class="space-y-2">
    <AddressInput
      v-model="to"
      :disabled="preview"
      :input-props="{ required: false }"
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
