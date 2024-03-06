<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset';
    variant?: 'danger' | 'white';
    primary?: boolean;
    loading?: boolean;
    disabled?: boolean;
    useWhiteText?: boolean;
  }>(),
  {
    type: 'button',
    variant: undefined,
    primary: false,
    loading: false,
    disabled: false,
    useWhiteText: false
  }
);

const skin = ref<string | null>(null);

const { domain } = useApp();
const { getSkin } = useSkin();

onMounted(async () => await getSkin(domain));
</script>

<template>
  <button
    :type="type || 'button'"
    :class="[
      'tune-button',
      {
        primary: primary,
        'white-border': variant === 'white',
        danger: variant === 'danger',
        disabled: disabled || loading,
        '!text-skin-bg': !skin && primary && !useWhiteText
      }
    ]"
    :disabled="disabled || loading"
  >
    <TuneLoadingSpinner v-if="loading" class="mx-auto" />

    <slot v-else />
  </button>
</template>
