<template>
  <div class="tooltip-box">
    <div
      @mouseenter="debounce(() => (hovered = true), 300)"
      @mouseleave="debounce(() => (hovered = false), 200)"
    >
      <slot />
    </div>
    <div v-if="hovered && text" class="tooltip">
      <span class="text">{{ text }}</span>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useDebounce } from '@/composables/useDebounce';

export default {
  props: {
    text: {
      type: String,
      required: true
    }
  },

  setup() {
    const hovered = ref(false);

    return { hovered, debounce: useDebounce() };
  }
};
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
  padding: 10px 15px 5px;
  border-radius: 20px;
  bottom: 18px;
  position: absolute;
  z-index: 1000;
  font-size: 16px;
  font-weight: 600;
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
</style>
