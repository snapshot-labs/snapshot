<template>
  <div
    ref="sidebar"
    style="height: 1px;"
    class="col-12 col-lg-3 float-left hide-sm hide-md hide-lg"
  >
    <div :style="style" class="position-fixed">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      style: {
        width: ''
      }
    };
  },
  mounted() {
    this.style.width = this.$refs.sidebar.clientWidth + 'px';
  }
};
</script>
