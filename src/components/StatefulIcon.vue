<template>
  <a
    :class="{ 'extra-icon': true, 'extra-icon-off': !this.on }"
    @click="handleClick($event)"
  >
    <Icon :name="name" size="20" />
  </a>
</template>

<script>
export default {
  props: {
    onName: { type: String },
    offName: { type: String },
    on: { type: Boolean, default: true }
  },
  computed: {
    name() {
      return this.on ? 'star' : 'star1';
    }
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
  top: 12px;
  right: 12px;
  padding: 8px;
  line-height: 16px;
}
</style>
