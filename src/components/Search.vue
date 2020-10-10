<template>
  <div class="d-flex flex-items-center">
    <Icon name="search" size="22" class="mb-1 mr-2 text-gray" />
    <input
      :value="value"
      :placeholder="placeholder"
      @input="handleInput"
      type="text"
      autocorrect="off"
      autocapitalize="none"
      class="border-0 input flex-auto"
    />
  </div>
</template>

<script>
export default {
  props: ['value', 'placeholder'],
  methods: {
    handleInput(e) {
      this.$emit('input', e.target.value);
    }
  }
};
</script>
