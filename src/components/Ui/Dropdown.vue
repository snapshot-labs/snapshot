<template>
  <div @click.capture="open = !open" class="position-relative">
    <div class="button">
      <slot />
    </div>
    <div
      class="sub-menu-wrapper anim-scale-in"
      :class="{ hidden: !open }"
      :style="cssVars"
    >
      <ul class="sub-menu my-2">
        <li v-for="item in items" :key="item" @click="handleClick(item.action)">
          {{ item.text }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  emits: ['select'],
  props: {
    items: Array,
    top: String,
    right: String
  },
  data() {
    return {
      open: false
    };
  },

  computed: {
    cssVars() {
      return { '--top': this.top, '--right': this.right };
    }
  },

  methods: {
    handleClick(action) {
      this.$emit('select', action);
      this.open = false;
    },
    close(e) {
      if (!this.$el.contains(e.target)) {
        this.open = false;
      }
    }
  },

  created() {
    window.addEventListener('click', this.close);
  },

  beforeUnmount() {
    window.removeEventListener('click', this.close);
  }
};
</script>

<style scoped lang="scss">
.button {
  cursor: pointer;
  color: var(--text-color);
  &:hover {
    color: var(--link-color);
  }
}
li {
  list-style: none;
  display: block;
  white-space: nowrap;
  padding-left: 24px;
  padding-right: 24px;
  padding-top: 4px;
  cursor: pointer;
}
li.disabled {
  cursor: not-allowed;
}
li:hover {
  background-color: var(--border-color);
  color: var(--link-color);
}
.sub-menu-wrapper {
  position: absolute;
  right: 0;
  top: var(--top);
  width: auto;
  background-color: var(--header-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 0 20px -6px var(--border-color);
}
.sub-menu-wrapper.hidden {
  display: none;
}
.sub-menu::before {
  content: '';
  position: absolute;
  top: -0.45rem;
  right: var(--right);
  height: 0.75rem;
  width: 0.75rem;
  background-color: var(--header-bg);
  border-top: 1px solid var(--border-color);
  border-left: 1px solid var(--border-color);
  transform: rotate(45deg);
  z-index: 10;
  opacity: 1;
  transition-delay: 0.3s;
}
</style>
