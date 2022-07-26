<script setup lang="ts">
import { useIntl } from '@/composables/useIntl';

const { formatNumber } = useIntl();

defineProps<{
  counter?: number | string;
}>();
</script>

<template>
  <div
    v-if="(counter && counter >= 0) || typeof counter === 'string'"
    class="h-[20px] min-w-[20px] rounded-full bg-skin-text px-1 text-center text-xs leading-normal text-white"
    v-text="formatNumber(Number(counter))"
  />
</template>
