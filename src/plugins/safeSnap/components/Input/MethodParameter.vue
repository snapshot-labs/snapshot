<script>
import { isParameterValue } from '../../utils/validator';
import { isArrayParameter } from '../../index';
import SafeSnapInputAddress from './Address.vue';
import SafeSnapInputArrayType from './ArrayType.vue';

export default {
  components: { SafeSnapInputAddress, SafeSnapInputArrayType },
  props: ['modelValue', 'disabled', 'parameter'],
  emits: ['update:modelValue', 'isValid'],
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
  computed: {
    isValid() {
      return isParameterValue(this.parameter.baseType, this.value);
    }
  },
  watch: {
    modelValue(value) {
      this.input = value;
    }
  },
  mounted() {
    if (this.modelValue) this.value = this.modelValue;
  },
  created() {
    if (this.modelValue) this.input = this.modelValue;
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
    :model-value="value"
    @update:modelValue="handleInput($event)"
  >
    <template #label>{{ placeholder }}</template>
    <option :value="true">true</option>
    <option :value="false">false</option>
  </UiSelect>

  <!-- ADDRESS -->
  <SafeSnapInputAddress
    v-else-if="parameter.type === 'address'"
    :disabled="disabled"
    :input-props="{ required: true }"
    :label="placeholder"
    :model-value="value"
    @update:modelValue="handleInput($event)"
  />
  <!-- Array of X type -->
  <SafeSnapInputArrayType
    v-else-if="isArrayType()"
    :disabled="disabled"
    :model-value="value"
    :parameter="parameter"
    @update:modelValue="handleInput($event)"
  />
  <!-- Text input -->
  <UiInput
    v-else
    :disabled="disabled"
    :error="dirty && !isValid && `Invalid ${parameter.type}`"
    :model-value="value"
    @update:modelValue="handleInput($event)"
  >
    <template #label>{{ placeholder }}</template>
  </UiInput>
</template>
