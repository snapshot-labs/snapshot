<template>
  <div :id="`${name}outer`" :style="{ height: style.height + 'px' }">
    <div
      :id="`${name}inner`"
      :style="{ width: style.width + 'px', 'z-index': 20 }"
      :class="classInner"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: ['name', 'isFixed'],
  data() {
    return {
      style: {
        width: '',
        height: ''
      }
    };
  },
  created() {
    window.addEventListener('resize', this.getDimensions);
  },
  mounted() {
    this.getDimensions();
  },
  computed: {
    classInner() {
      return {
        'position-absolute': !this.isFixed,
        'position-fixed': this.isFixed
      };
    }
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
