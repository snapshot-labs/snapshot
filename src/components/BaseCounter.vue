<script setup>
import { useIntl } from '@/composables/useIntl';

const { formatNumber } = useIntl();

defineProps({
  counter: [Number, String]
});
</script>

<template>
  <div
    v-if="counter >= 0 || typeof counter === 'string'"
    v-text="formatNumber(counter)"
    class="h-[20px] min-w-[20px] rounded-full leading-normal text-xs text-white bg-skin-text text-center px-1"
  />
</template>
