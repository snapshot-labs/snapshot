<script setup lang="ts">
import { ref } from 'vue';
import { shorten } from '@/helpers/utils';
import { useCopy } from '@/composables/useCopy';
import { debouncedWatch } from '@vueuse/core';

defineProps<{
  realityAddress: string;
  multiSendAddress: string;
}>();

const open = ref(false);
const hovered = ref(false);

debouncedWatch(
  hovered,
  () => {
    open.value = hovered.value;
  },
  { debounce: 300 }
);

const { copyToClipboard } = useCopy();
</script>

<template>
  <div
    class="tooltip-box"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.9844 17H11.002V9.60352H12.9844V17ZM10.8857 7.68945C10.8857 7.39323 10.9837 7.14941 11.1797 6.95801C11.3802 6.7666 11.6514 6.6709 11.9932 6.6709C12.3304 6.6709 12.5993 6.7666 12.7998 6.95801C13.0003 7.14941 13.1006 7.39323 13.1006 7.68945C13.1006 7.99023 12.998 8.23633 12.793 8.42773C12.5924 8.61914 12.3258 8.71484 11.9932 8.71484C11.6605 8.71484 11.3916 8.61914 11.1865 8.42773C10.986 8.23633 10.8857 7.99023 10.8857 7.68945Z"
        fill="currentColor"
      />
      <rect
        x="1"
        y="1"
        width="22"
        height="22"
        rx="11"
        stroke="currentColor"
        stroke-width="2"
      />
    </svg>
    <div v-if="open" class="tooltip border bg-skin-bg p-3 md:rounded-lg">
      <span class="tooltip-text">Multisend address</span>
      <span class="tooltip-text mt-1 text-skin-text">
        {{ shorten(multiSendAddress) }}
        <BaseIcon
          class="ml-1"
          name="copy"
          size="16"
          @click="copyToClipboard(multiSendAddress)"
        />
      </span>
      <span class="tooltip-text mt-3">Reality Module address</span>
      <span class="tooltip-text mt-1 text-skin-text">
        {{ shorten(realityAddress) }}
        <BaseIcon
          class="ml-1"
          name="copy"
          size="16"
          @click="copyToClipboard(realityAddress)"
        />
      </span>
    </div>
  </div>
</template>

<style scoped>
.tooltip-box {
  position: relative;
}

.tooltip {
  width: 200px;
  left: 40px;
  top: -8px;
  position: absolute;
  z-index: 99999;
  box-shadow: 0 1px 17px 0 rgba(233, 236, 240, 1);
}

.tooltip-text {
  display: block;
  font-weight: 700;
  font-size: 16px;
  line-height: 16px;
}
</style>
