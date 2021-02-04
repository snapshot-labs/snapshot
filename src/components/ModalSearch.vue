<template>
  <div style="height:60px" class="search-container py-3 px-4">
    <div class="d-flex flex-items-center">
      <Icon name="search" size="22" class="mb-1 mr-2 text-gray" />
      <input
        ref="searchInput"
        :value="modelValue"
        :placeholder="placeholder"
        @input="handleInput"
        type="text"
        autocorrect="off"
        autocapitalize="none"
        class="border-0 input flex-auto"
      />
      <a @click="clearInput">
        <Icon v-if="modelValue" name="close" size="12" class="mb-1" />
      </a>
    </div>
  </div>
</template>

<script>
export default {
  props: ['modelValue', 'placeholder'],
  emits: ['update:modelValue'],
  mounted() {
    this.$refs.searchInput.focus();
  },
  methods: {
    handleInput(e) {
      const input = e.target.value;
      this.$emit('update:modelValue', input);
    },
    clearInput() {
      this.$emit('update:modelValue', '');
    }
  }
};
</script>

<style lang="scss" scoped>
.search-container {
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
}
</style>
