<template>
  <div>
    <div v-if="isFixed" :style="`height: ${offsetHeight}px;`" />
    <div
      style="z-index: 20"
      id="sticky"
      :class="{ 'position-fixed width-full top-0': isFixed }"
    >
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  props: ['isSticky'],
  data() {
    return {
      isFixed: false,
      offsetTop: -1,
      offsetHeight: 0
    };
  },
  mounted() {
    if (this.isSticky === false) return;
    window.addEventListener('scroll', this.onScroll);
    const el = document.getElementById('sticky');
    if (el) {
      this.offsetTop = el.offsetTop;
      this.offsetHeight = el.offsetHeight;
    }
  },
  beforeUnmount() {
    if (this.isSticky === false) return;
    window.removeEventListener('scroll', this.onScroll);
  },
  methods: {
    onScroll(e) {
      if (this.isSticky === false) return;
      const windowTop = e.target.documentElement.scrollTop;
      this.isFixed = windowTop >= this.offsetTop;
    }
  }
};
</script>
