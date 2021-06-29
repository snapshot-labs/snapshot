<template>
  <UiTooltip :text="tooltip">
    <span class="Progress overflow-hidden anim-scale-in">
      <span
        v-for="(bar, i) in bars"
        :key="i"
        :style="`width: ${parseFloat((100 / max) * bar).toFixed(3)}%;`"
      />
    </span>
  </UiTooltip>
</template>

<script>
import { computed } from 'vue';
export default {
  props: ['value', 'max', 'titles', 'tooltip'],
  setup(props) {
    const bars = computed(() =>
      Array.isArray(props.value) ? props.value : [props.value]
    );
    const total = computed(() => bars.value.reduce((a, b) => a + b, 0));

    return { bars, total };
  }
};
</script>

<style scoped lang="scss">
.Progress {
  background-color: var(--border-color);
  height: 8px;
  border-radius: 4px;
  border: var(--border-color) 1px solid;
  &:hover {
    border: var(--primary-color) !important;
  }

  span:first-child {
    background-color: var(--primary-color) !important;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }

  span:nth-child(1) {
    opacity: 1;
  }

  span:nth-child(2) {
    opacity: 0.75;
  }

  span:nth-child(3) {
    opacity: 0.5;
  }

  span:nth-child(4) {
    opacity: 0.25;
  }

  span:last-child {
    background-color: var(--primary-color) !important;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }
}
</style>
