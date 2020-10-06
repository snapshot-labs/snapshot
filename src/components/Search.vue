<template>
  <div class="d-flex flex-items-center">
    <Icon name="search" size="22" class="mb-1 mr-2 text-gray" />
    <input
      :value="value"
      :placeholder="placeholder"
      @input="handleInput"
      type="search"
      autocorrect="off"
      autocapitalize="none"
      class="border-0 input flex-auto width-full"
    />
    <a href="#" @click="clearInput">
      <Icon v-if="value" name="close" size="12" class="mb-1" />
    </a>
  </div>
</template>

<script>
export default {
  props: ['value', 'placeholder'],
  methods: {
    handleInput(e) {
      this.$emit('update:value', e.target.value);
    },
    clearInput() {
      this.$emit('update:value', '');
    }
  }
};
</script>