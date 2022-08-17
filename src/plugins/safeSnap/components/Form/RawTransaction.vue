<script setup lang="ts">
import { validateTransaction } from '../../index';
import { rawToModuleTransaction } from '@/plugins/safeSnap/utils/transactions';
import { isHexString } from '@ethersproject/bytes';
import { parseAmount } from '@/helpers/utils';
import SafeSnapInputAddress from '../Input/Address.vue';
import { computed, onMounted, ref, watch } from 'vue';

const props = defineProps(['modelValue', 'nonce', 'config']);
const emit = defineEmits(['update:modelValue']);

const to = ref('');
const data = ref('');
const value = ref('0');

const isValidValue = computed(() => {
  if (!value.value.length) return true;
  try {
    parseAmount(value.value);
    return true;
  } catch {
    return false;
  }
});

const isValidData = computed(() => {
  return !data.value.length || isHexString(data.value);
});

const updateTransaction = () => {
  const transaction = rawToModuleTransaction({
    value: value.value,
    to: to.value,
    data: data.value,
    nonce: props.nonce
  });

  if (validateTransaction(transaction)) {
    emit('update:modelValue', transaction);
    return;
  }
  emit('update:modelValue', undefined);
};

watch([to, value, data], updateTransaction);

onMounted(async () => {
  if (props.modelValue) {
    to.value = props.modelValue.to || '';
    value.value = props.modelValue.value || '0';
    data.value = props.modelValue.data || '';
  }
});
</script>

<template>
  <div class="space-y-2">
    <SafeSnapInputAddress
      v-model="to"
      :input-props="{ required: false }"
      :label="$t('safeSnap.to')"
    />

    <UiInput
      v-model="value"
      :error="!isValidValue && $t('safeSnap.invalidValue')"
    >
      <template #label>{{ $t('safeSnap.value') }}</template>
    </UiInput>

    <UiInput v-model="data" :error="!isValidData && $t('safeSnap.invalidData')">
      <template #label>{{ $t('safeSnap.data') }}</template>
    </UiInput>
  </div>
</template>
