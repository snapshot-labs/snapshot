<script setup>
import { ref, defineProps } from 'vue';
import { useDebounce } from '@/composables/useDebounce';

defineProps({
  text: {
    type: String
  },
  show: {
    type: Boolean,
    default: true
  },
  direction: {
    type: String
  }
});

const hovered = ref(false);

const debounce = useDebounce();
</script>

<style scoped>
.tooltip-box {
  position: relative;
}
.tooltip {
  pointer-events: none;
  background-color: var(--text-color);
  color: var(--header-bg);
  max-width: 350px;
  word-wrap: break-word;
  width: max-content;
  text-align: center;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 15px 2px;
  border-radius: 20px;
  bottom: 38px;
  position: absolute;
  z-index: 99999;
  font-size: 16px;
  font-weight: 600;
  line-height: 28px !important;
}

.tooltip-nw {
  transform: translateX(-90%) !important;
}

.text::after {
  content: ' ';
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: var(--text-color) transparent transparent transparent;
}

.text-nw::after {
  left: 85% !important;
}
</style>

<template>
  <div class="tooltip-box">
    <div
      @mouseenter="debounce(() => (hovered = true), 300)"
      @mouseleave="debounce(() => (hovered = false), 200)"
    >
      <slot />
    </div>
    <div
      v-if="hovered && text && show"
      class="tooltip"
      :class="{ 'tooltip-nw': direction == 'left' }"
    >
      <span class="text" :class="{ 'text-nw': direction == 'left' }">{{
        text
      }}</span>
    </div>
  </div>
</template>
