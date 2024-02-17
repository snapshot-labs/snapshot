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

const { domain } = useApp();
</script>

<template>
  <button
    :type="type || 'button'"
    :class="[
      'tune-button',
      {
        primary: primary,
        danger: variant === 'danger',
        disabled: disabled,
        '!text-skin-bg': !domain && primary
      }
    ]"
    :disabled="disabled || loading"
  >
    <TuneLoadingSpinner v-if="loading" class="mx-auto" />

    <slot v-else />
  </button>
</template>
