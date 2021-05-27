<template>
  <UiTextarea
    modelValue="input"
    @update:modelValue="handleInput($event)"
    :textareaProps="{ placeholder: this.placeholder }"
    :error="dirty && !isValid && `Invalid ${type}`"
  />
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

const typePlaceholder = (name, type) => {
  if (isAddress(type)) {
    return `${name} (${type}) E.g.: ["0xACa94ef8bD5ffEE41947b4585a84BdA5a3d3DA6E","0x1dF62f291b2E969fB0849d99D9Ce41e2F137006e"]`;
  }

  if (isBoolean(type)) {
    return `${name} (${type}) E.g.: [true, false, false, true]`;
  }

  if (isUint(type)) {
    return `${name} (${type}) E.g.: [1000, 212, 320000022, 23]`;
  }

  if (isInt(type)) {
    return `${name} (${type}) E.g.: [1000, -212, 1232, -1]`;
  }

  if (isByte(type)) {
    return `${name} (${type}) E.g.: ["0xc00000000000000000000000000000000000", "0xc00000000000000000000000000000000001"]`;
  }

  return `${name} (${type}) E.g.: ["first value", "second value", "third value"]`;
};
export default {
  props: ['name', 'type'],
  emits: [],
  data() {
    return {
      input: '',
      placeholder: typePlaceholder(this.name, this.type),
      dirty: false
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
