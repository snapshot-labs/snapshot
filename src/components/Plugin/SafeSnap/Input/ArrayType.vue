<template>
  <UiInput
    :disabled="disabled"
    :error="dirty && !isValid && `Invalid ${type}`"
    :modelValue="value"
    :placeholder="placeholder"
    @update:modelValue="handleInput($event)"
  >
    <template v-slot:label>{{ label }}</template>
  </UiInput>
</template>

<script>
import {
  isAddress,
  isBoolean,
  isByte,
  isInt,
  isStringArray,
  isUint
} from '@/helpers/validator';

const getPlaceholder = (name, type) => {
  if (isAddress(type)) {
    return 'E.g.: ["0xACa94ef8bD5ffEE41947b4585a84BdA5a3d3DA6E","0x1dF62f291b2E969fB0849d99D9Ce41e2F137006e"]';
  }

  if (isBoolean(type)) {
    return 'E.g.: [true, false, false, true]';
  }

  if (isUint(type)) {
    return 'E.g.: [1000, 212, 320000022, 23]';
  }

  if (isInt(type)) {
    return 'E.g.: [1000, -212, 1232, -1]';
  }

  if (isByte(type)) {
    return 'E.g.: ["0xc00000000000000000000000000000000000", "0xc00000000000000000000000000000000001"]';
  }

  return 'E.g.: ["first value", "second value", "third value"]';
};

export default {
  props: ['name', 'type', 'disabled'],
  emits: [],
  data() {
    const label = `${this.name} (${this.type})`;
    const placeholder = getPlaceholder(this.name, this.type);
    return {
      input: '',
      dirty: false,
      placeholder,
      label
    };
  },
  computed: {
    isValid() {
      return isStringArray(this.input);
    }
  },
  methods: {
    handleInput(value) {
      this.input = value;
      this.dirty = true;
    }
  }
};
</script>
