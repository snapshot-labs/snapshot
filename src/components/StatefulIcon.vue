<template>
  <button :class="buttonClasses" @click="handleClick($event)">
    <Icon :name="name" size="22" />
  </button>
</template>

<script>
export default {
  props: {
    onName: { type: String },
    offName: { type: String },
    on: { type: Boolean, default: true }
  },
  emits: ['favorite'],
  computed: {
    name() {
      return this.on ? 'favorite-on' : 'favorite-off';
    },
    buttonClasses() {
      return {
        'extra-icon': true,
        'extra-icon-off': !this.on,
        'text-primary': this.on,
        'text-gray': !this.on
      };
    }
  },
  methods: {
    handleClick(e) {
      e.preventDefault();
      this.$emit('favorite');
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
  border: none;
  background-color: transparent;
}
</style>
