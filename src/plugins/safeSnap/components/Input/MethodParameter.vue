<script>
import { isParameterValue } from '@/helpers/validator';
import { isArrayParameter } from '../../index';
import SafeSnapInputAddress from './Address.vue';
import SafeSnapInputArrayType from './ArrayType.vue';

export default {
  components: { SafeSnapInputAddress, SafeSnapInputArrayType },
  props: ['modelValue', 'disabled', 'parameter'],
  emits: ['update:modelValue', 'isValid'],
  mounted() {
    if (this.modelValue) this.value = this.modelValue;
  },
  data() {
    const placeholder = this.parameter.name
      ? `${this.parameter.name} (${this.parameter.type})`
      : this.parameter.type;

    let value;
    if (this.parameter.type === 'bool') value = false;

    return {
      placeholder,
      value,
      dirty: false
    };
  },
  created() {
    if (this.modelValue) this.input = this.modelValue;
  },
  watch: {
    modelValue(value) {
      this.input = value;
    }
  },
  computed: {
    isValid() {
      return isParameterValue(this.parameter.baseType, this.value);
    }
  },
  methods: {
    handleInput(value) {
      this.value = value;
      this.dirty = true;
      this.$emit('update:modelValue', value);
      this.$emit('isValid', this.isValid);
    },
    isArrayType() {
      return isArrayParameter(this.parameter.baseType);
    }
  }
};
</script>

<template>
  <UiSelect
    v-if="parameter.type === 'bool'"
    :disabled="disabled"
    :modelValue="value"
    @update:modelValue="handleInput($event)"
  >
    <template v-slot:label>{{ placeholder }}</template>
    <option :value="true">true</option>
    <option :value="false">false</option>
  </UiSelect>

  <!-- ADDRESS -->
  <SafeSnapInputAddress
    v-else-if="parameter.type === 'address'"
    :disabled="disabled"
    :inputProps="{ required: true }"
    :label="this.placeholder"
    :modelValue="value"
    @update:modelValue="handleInput($event)"
  />
  <!-- Array of X type -->
  <SafeSnapInputArrayType
    v-else-if="isArrayType()"
    :disabled="disabled"
    :modelValue="value"
    :parameter="parameter"
    @update:modelValue="handleInput($event)"
  />
  <!-- Text input -->
  <UiInput
    v-else
    :disabled="disabled"
    :error="dirty && !isValid && `Invalid ${parameter.type}`"
    :modelValue="value"
    @update:modelValue="handleInput($event)"
  >
    <template v-slot:label>{{ placeholder }}</template>
  </UiInput>
</template>
