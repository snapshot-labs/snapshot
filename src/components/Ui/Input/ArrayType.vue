<template>
  <UiTextarea v-model="input" :placeholder="typePlaceholder(name, type)" />
</template>

<script>
import {
  isAddress,
  isBoolean,
  isByte,
  isInt,
  isUint
} from '@/helpers/validator';

export default {
  props: ['name', 'type'],
  emits: ['is:valid'],
  data() {
    return {
      input: ""
    };
  },
  methods: {
    typePlaceholder(name, type) {
      if (isAddress(type)) {
        return `${name} E.g.: ["0xACa94ef8bD5ffEE41947b4585a84BdA5a3d3DA6E","0x1dF62f291b2E969fB0849d99D9Ce41e2F137006e"]`;
      }

      if (isBoolean(type)) {
        return `${name} E.g.: [true, false, false, true]`;
      }

      if (isUint(type)) {
        return `${name} E.g.: [1000, 212, 320000022, 23]`;
      }

      if (isInt(type)) {
        return `${name} E.g.: [1000, -212, 1232, -1]`;
      }

      if (isByte(type)) {
        return `${name} E.g.: ["0xc00000000000000000000000000000000000", "0xc00000000000000000000000000000000001"]`;
      }

      return `${name} E.g.: ["first value", "second value", "third value"]`;
    },
    isValid() {
      try {
        const values = JSON.parse(value);
        return Array.isArray(values);
      } catch (e) {
        return false;
      }
    }
  }
};
</script>

<style scoped></style>
