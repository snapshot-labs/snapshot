<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset';
    variant?: 'danger';
    primary?: boolean;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    type: 'button',
    variant: undefined,
    primary: false,
    loading: false,
    disabled: false
  }
);
</script>

<template>
  <button
    :type="type || 'button'"
    :class="[
      'tune-button',
      {
        primary: primary,
        danger: variant === 'danger',
        disabled: disabled
      }
    ]"
    :disabled="disabled || loading"
  >
    <TuneLoadingSpinner v-if="loading" class="mx-auto" />

    <slot v-else />
  </button>
</template>
