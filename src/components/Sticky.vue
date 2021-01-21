<template>
  <div :id="`${name}outer`" :style="{ height: style.height + 'px' }">
    <div
      :id="`${name}inner`"
      :style="{ width: style.width + 'px' }"
      class="position-fixed"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: ['name'],
  data() {
    return {
      style: {
        width: '',
        height: '',
        'z-index': 20
      }
    };
  },
  created() {
    window.addEventListener('resize', this.getDimensions);
  },
  mounted() {
    this.getDimensions();
  },
  methods: {
    getDimensions() {
      const elOuter = document.getElementById(`${this.name}outer`);
      this.style.width = elOuter.clientWidth;
      const elInner = document.getElementById(`${this.name}inner`);
      this.style.height = elInner.clientHeight - 1;
    }
  }
};
</script>
