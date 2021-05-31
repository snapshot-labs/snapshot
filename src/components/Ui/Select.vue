<template>
  <UiButton class="width-full mb-2 d-flex">
    <div class="text-gray mr-2">
      <slot name="label" />
    </div>
    <select
      :disabled="disabled"
      v-model="input"
      class="input flex-auto height-full"
      @change="handleChange"
    >
      <slot />
    </select>
  </UiButton>
</template>

<script>
export default {
  props: ['modelValue', 'disabled'],
  emits: ['update:modelValue', 'change'],
  data() {
    return { input: this.modelValue };
  },
  methods: {
    handleChange() {
      this.$emit('update:modelValue', this.input);
      this.$emit('change');
    }
  }
};
</script>

<style scoped></style>
