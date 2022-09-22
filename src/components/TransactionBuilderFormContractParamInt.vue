<script setup lang="ts">
import { computed, ref } from 'vue';
import { BigNumber } from '@ethersproject/bignumber';
import BN from 'bn.js';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    exactIntType: string;
    label: string;
  }>(),
  {
    modelValue: '0'
  }
);

defineEmits<{
  (e: 'update:modelValue', value: BigNumber): void;
}>();

const input = ref<string>(props.modelValue);

const allowOnlyPositive = computed(() => props.exactIntType.startsWith('u'));
const maxBits = computed(() => Number(props.exactIntType.replace(/^\D+/, '')));
const minNumber = computed(() => {
  if (allowOnlyPositive.value) {
    return new BN(0);
  } else {
    return new BN(2).pow(new BN(maxBits.value - 1)).neg();
  }
});
const maxNumber = computed(() => {
  if (allowOnlyPositive.value) {
    return new BN(2).pow(new BN(maxBits.value)).sub(new BN(1));
  } else {
    return new BN(2).pow(new BN(maxBits.value - 1)).sub(new BN(1));
  }
});

/*
Use BN.js directly here because:
https://docs.ethers.io/v5/api/utils/bignumber/#BigNumber--BigNumber--notes--why-not-bignumber-js-bn-js-bigdecimal-etc
But I want to use bitLength() on BN.js to check the number of bits.
Unfortunately this also has a bug because it ignores the sign bit.
-128 is 9 bits, but bitLength() returns 8.
*/
const numberRangeError = computed<{ message: string } | undefined>(() => {
  const bigNumber = new BN(input.value);

  if (allowOnlyPositive.value && bigNumber.isNeg())
    return {
      message: 'Only positive numbers are allowed'
    };

  if (bigNumber.gt(maxNumber.value))
    return {
      message: `Number is too large for ${maxBits.value} bits`
    };

  if (bigNumber.lt(minNumber.value))
    return {
      message: `Number is too small for ${maxBits.value} bits`
    };

  return undefined;
});
</script>

<template>
  <LabelInput>{{ label }}</LabelInput>
  <InputString
    v-model="input"
    placeholder="0x..."
    :error="numberRangeError"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>
