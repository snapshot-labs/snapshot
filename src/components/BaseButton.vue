<script setup lang="ts">
defineProps<{
  primary?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset' | undefined;
  disabled?: boolean;
  small?: boolean;
}>();
</script>

<template>
  <button
    :type="type || 'button'"
    :class="[
      'button px-[22px] ',
      {
        'button--primary hover:brightness-95': primary,
        'button--small': small
      }
    ]"
    :disabled="disabled || loading"
  >
    <LoadingSpinner v-if="loading" />
    <slot v-else />
  </button>
</template>

<style scoped lang="scss">
.button {
  border: 1px solid var(--border-color);
  background-color: transparent;
  color: var(--link-color);
  border-radius: 23px;
  height: 46px;
  font-size: 18px;
  white-space: nowrap;

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

  &.button--small {
    padding: 0 10px;
    height: 28px;
    font-size: 14px;
  }

  &:hover {
    color: var(--link-color);
    border-color: var(--text-color);
  }

  &:disabled {
    color: var(--border-color) !important;
    cursor: not-allowed;
  }
}
</style>
