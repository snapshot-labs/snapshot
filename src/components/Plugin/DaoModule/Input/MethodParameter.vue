<template>
  <!-- TODO: BOOL -->
  <!-- ADDRESS -->
  <PluginDaoModuleInputAddress
    v-if="type === 'address'"
    :inputProps="{
      placeholder: this.placeholder,
      required: true
    }"
    :modelValue="value"
    @update:modelValue="handleInput($event)"
  />
  <!-- Array of X type -->
  <PluginDaoModuleInputArrayType
    v-else-if="isArrayType()"
    :modelValue="value"
    :name="name"
    :type="type"
    @update:modelValue="handleInput($event)"
  />
  <!-- Text input -->
  <UiInput
    v-else
    :error="!isValid && `Invalid ${type}`"
    :modelValue="value"
    :placeholder="placeholder"
    @update:modelValue="handleInput($event)"
  />
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
