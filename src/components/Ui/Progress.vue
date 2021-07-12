<script>
import { computed } from 'vue';

export default {
  props: { value: { Number, Array }, max: Number },
  setup(props) {
    const bars = computed(() =>
      Array.isArray(props.value) ? props.value : [props.value]
    );
    const total = computed(() => bars.value.reduce((a, b) => a + b, 0));

    return { bars, total };
  }
};
</script>

<template>
  <span class="Progress Progress--small overflow-hidden anim-scale-in">
    <span
      v-for="(bar, i) in bars"
      :key="i"
      :style="`width: ${parseFloat((100 / max) * bar).toFixed(3)}%;`"
      class="bg-blue"
    />
  </span>
</template>

<style scoped lang="scss">
.Progress {
  background-color: var(--border-color);
  height: 8px;
  border-radius: 4px;

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
