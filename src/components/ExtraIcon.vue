<template>
  <a class="extra-icon" @click="handleClick($event)"><slot /></a>
</template>

<script>
export default {
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
