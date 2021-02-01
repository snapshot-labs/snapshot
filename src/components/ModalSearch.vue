<template>
  <div style="height:60px">
    <div
      class="position-absolute bg-white py-3 px-3 px-md-4 width-full"
      style="box-sizing: border-box;"
    >
      <UiButton class="width-full">
        <div class="d-flex flex-items-center">
          <Icon name="search" size="22" class="mb-1 mr-2 text-gray" />
          <input
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
      </UiButton>
    </div>
  </div>
</template>

<script>
export default {
  props: ['modelValue', 'placeholder'],
  emits: ['update:modelValue'],
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
