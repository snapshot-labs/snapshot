<template>
  <!-- TODO: BOOL -->
  <!-- ADDRESS -->
  <PluginSafeSnapInputAddress
    v-if="type === 'address'"
    :label="this.placeholder"
    :inputProps="{
      required: true
    }"
    :modelValue="value"
    @update:modelValue="handleInput($event)"
  />
  <!-- Array of X type -->
  <PluginSafeSnapInputArrayType
    v-else-if="isArrayType()"
    :modelValue="value"
    :name="name"
    :type="type"
    @update:modelValue="handleInput($event)"
  />
  <!-- Text input -->
  <UiInput
    v-else
    :error="dirty && !isValid && `Invalid ${type}`"
    :modelValue="value"
    @update:modelValue="handleInput($event)"
  >
    <template v-slot:label>{{ this.placeholder }}</template>
  </UiInput>
</template>

<script>
import { isArrayParameter, isParameterValue } from '@/helpers/validator';

export default {
  props: ['modelValue', 'name', 'type'],
  emits: ['update:modelValue', 'isValid'],
  data() {
    const placeholder = this.name ? `${this.name} (${this.type})` : this.type;
    return {
      placeholder,
      dirty: false,
      value: undefined
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

<style scoped></style>
