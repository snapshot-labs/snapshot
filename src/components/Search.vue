<template>
  <div class="d-flex flex-items-center">
    <Icon name="search" size="22" class="mb-1 mr-2 text-gray" />
    <input
      :value="searchValue"
      :placeholder="placeholder"
      @input="handleInput"
      type="search"
      autocorrect="off"
      autocapitalize="none"
      class="border-0 input flex-auto width-full"
    />
    <Icon
      v-if="searchValue"
      name="close"
      size="16"
      class="mb-1 text-gray button-close"
      @click="clearInput"
    />
  </div>
</template>

<script>
export default {
  props: ['searchValue', 'placeholder'],
  methods: {
    handleInput(e) {
      this.$emit('update:searchValue', e.target.value);
    },
    clearInput() {
      this.$emit('update:searchValue', '');
    }
  }
};
</script>

<style scoped lang="scss">
.button-close {
  opacity: 0.6;
}
.button-close:hover {
  opacity: 1;
}
</style>
