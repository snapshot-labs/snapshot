<script setup lang="ts">
const props = defineProps<{
  variant: 'success' | 'loading' | 'error' | 'gift';
}>();

const badgeClass = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'bg-green/10 border-green/40';
    case 'loading':
      return 'bg-[--border-color-subtle] border-[--border-color-soft]';
    case 'error':
      return 'bg-red/10 border-red/40';
    case 'gift':
      return 'bg-boost/10 border-boost/40';
  }
});
</script>

<template>
  <div
    class="w-[64px] h-[64px] mx-auto shadow-xl border rounded-[20px] flex justify-center items-center"
    :class="badgeClass"
  >
    <i-ho-check-circle
      v-if="variant === 'success'"
      class="text-green text-sm"
    />
    <i-ho-exclamation-circle v-else-if="variant === 'error'" class="text-red" />
    <i-ho-gift v-else-if="variant === 'gift'" class="text-boost" />
    <TuneLoadingSpinner v-else />
  </div>
</template>
