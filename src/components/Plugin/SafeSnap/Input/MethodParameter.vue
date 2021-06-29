<template>
  <UiSelect
    v-if="type === 'bool'"
    :disabled="disabled"
    :modelValue="value"
    @update:modelValue="handleInput($event)"
  >
    <template v-slot:label>{{ placeholder }}</template>
    <option :value="true">true</option>
    <option :value="false">false</option>
  </UiSelect>

  <!-- ADDRESS -->
  <PluginSafeSnapInputAddress
    v-else-if="type === 'address'"
    :disabled="disabled"
    :inputProps="{
      required: true
    }"
    :label="this.placeholder"
    :modelValue="value"
    @update:modelValue="handleInput($event)"
  />
  <!-- Array of X type -->
  <PluginSafeSnapInputArrayType
    v-else-if="isArrayType()"
    :disabled="disabled"
    :modelValue="value"
    :name="name"
    :type="type"
    @update:modelValue="handleInput($event)"
  />
  <!-- Text input -->
  <UiInput
    v-else
    :disabled="disabled"
    :error="dirty && !isValid && `Invalid ${type}`"
    :modelValue="value"
    @update:modelValue="handleInput($event)"
  >
    <template v-slot:label>{{ placeholder }}</template>
  </UiInput>
</template>

<script>
import { isArrayParameter, isParameterValue } from '@/helpers/validator';

export default {
  props: ['modelValue', 'name', 'type', 'disabled'],
  emits: ['update:modelValue', 'isValid'],
  mounted() {
    if (this.modelValue) this.value = this.modelValue;
  },
  data() {
    const placeholder = this.name ? `${this.name} (${this.type})` : this.type;

    let value;
    if (this.type === 'bool') value = false;

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
      return isParameterValue(this.type, this.value);
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
      return isArrayParameter(this.type);
    }
  }
};
</script>
