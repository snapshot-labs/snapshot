<template>
  <a @click="handleToggle">
    <Icon
      :name="input ? 'toggle-on' : 'toggle_off'"
      :class="input ? 'text-green' : 'border-color'"
      size="32"
    />
  </a>
</template>

<script>
export default {
  props: {
    modelValue: Boolean
  },
  emits: ['update:modelValue'],
  data() {
    return {
      input: false
    };
  },
  created() {
    if (this.modelValue) this.input = this.modelValue.toString();
  },
  methods: {
    handleToggle() {
      this.input = !this.input;
      this.$emit('update:modelValue', this.input);
    }
  }
};
</script>
