<template>
  <span class="Progress Progress--small overflow-hidden anim-scale-in">
    <span
      v-for="(bar, i) in bars"
      :key="i"
      :style="`width: ${parseInt((100 / max) * bar)}%;`"
      class="bg-blue"
    />
  </span>
</template>

<script>
export default {
  props: ['value', 'max'],
  computed: {
    bars() {
      return Array.isArray(this.value) ? this.value : [this.value];
    },
    total() {
      return this.bars.reduce((a, b) => a + b, 0);
    }
  }
};
</script>

<style scoped lang="scss">
@import '../../vars';

.Progress {
  background-color: $bg-gray-dark;
  height: 8px;
  border-radius: 4px;

  span:last-child {
    background-color: transparentize($blue, 0.4) !important;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }
}
</style>
