<template>
  <div class="d-flex flex-items-center">
    <Icon name="search" size="22" class="mb-1 mr-2 text-gray" />
    <input
      :value="modelValue"
      :placeholder="placeholder"
      @input="handleInput"
      type="text"
      autocorrect="off"
      autocapitalize="none"
      class="border-0 input flex-auto width-full"
    />
    <a @click="clearInput">
      <Icon v-if="modelValue" name="close" size="12" class="mb-1" />
    </a>
  </div>
</template>

<script>
export default {
  props: ['modelValue', 'placeholder'],
  emits: ['update:modelValue'],
  methods: {
    handleInput(e) {
      const input = e.target.value;
      this.$router.push({ query: input ? { q: input } : {} });
      this.$emit('update:modelValue', input);
    },
    clearInput() {
      this.$router.push({});
      this.$emit('update:modelValue', '');
    }
  }
};
</script>
