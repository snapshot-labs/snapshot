<script setup>
defineProps({
  primary: {
    type: Boolean,
    default: false
  },
  slim: Boolean,
  loading: Boolean,
  type: String,
  disabled: {
    type: Boolean,
    default: false
  }
});
</script>

<template>
  <button
    :type="type || 'button'"
    :class="[
      'button px-[24px] focus-within:border-skin-link',
      { 'button--primary': primary, slim }
    ]"
    :disabled="disabled || loading"
  >
    <UiLoading v-if="loading" :fill-white="primary" />
    <slot v-else />
  </button>
</template>

<style scoped lang="scss">
.button {
  border: 1px solid var(--border-color);
  background-color: transparent;
  color: var(--link-color);
  border-radius: 23px;
  outline: none;
  line-height: 46px;
  height: 46px;
  font-size: 18px;
  padding-left: 24px;
  padding-right: 24px;
  
  &.slim {
    line-height: 38px;
    height: 38px;
    font-size: 16px;
    padding-left: 18px;
    padding-right: 18px;
  }

  &.button--primary {
    color: white;
    background-color: var(--primary-color);
    border: 1px solid var(--primary-color);

    &:hover {
      color: white;
      background-color: var(--primary-color);
      border: 1px solid var(--primary-color);
    }

    &:disabled {
      color: var(--link-color) !important;
      border: 1px solid var(--border-color);
      background-color: var(--border-color);
    }
  }

  &.button--active {
    border-color: var(--link-color) !important;
  }

  &:hover {
    color: var(--link-color);
    border-color: var(--link-color);
  }

  &:disabled {
    color: var(--border-color) !important;
    cursor: not-allowed;
  }
}
</style>
