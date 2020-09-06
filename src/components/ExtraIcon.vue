<template>
  <a
    :class="{ 'extra-icon': true, 'extra-icon-off': !this.on }"
    @click="handleClick($event)"
  >
    <slot />
  </a>
</template>

<script>
export default {
  props: {
    on: { type: Boolean, default: true }
  },
  methods: {
    handleClick(e) {
      e.preventDefault();

      this.$emit('click');
    }
  }
};
</script>

<style scoped lang="scss">
.extra-icon {
  position: absolute;
  top: 24px;
  right: 24px;
}
</style>
