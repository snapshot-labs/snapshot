<template>
  <div class="position-relative">
    <button @click="open = !open" class="button mr-1">
      <Icon name="threedots" size="25" class="v-align-text-bottom" />
    </button>
    <div class="sub-menu-wrapper" :class="{ hidden: !open }">
      <ul class="sub-menu my-2">
        <!-- TODO: remove "disabled" class when feature is released -->
        <li
          v-for="item in items"
          :key="item"
          class="disabled"
          @click="emitItem(item.action)"
        >
          {{ item.text }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      open: false,
      items: [
        { text: 'Delete proposal', action: 'delete' },
        { text: 'Second item', action: 'second' },
        { text: 'Third item', action: 'third' }
      ]
    };
  },
  methods: {
    emitItem(action) {
      this.$emit(action);
      this.open = false;
    }
  }
};
</script>

<style scoped lang="scss">
.button {
  border: none;
  background-color: transparent;
  color: var(--text-color);
  padding: 0 8px;
  line-height: 24px;
  height: 28px;
  font-size: 18px;

  &:hover {
    color: var(--link-color);
  }

  &:disabled {
    color: var(--border-color) !important;
    cursor: not-allowed;
  }
}

li {
  list-style: none;
  display: block;
  white-space: nowrap;
  padding-left: 24px;
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
  top: 1.8rem;
  width: 180px;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: -5px 5px 20px var(--border-color);
}

.sub-menu-wrapper.hidden {
  display: none;
}

.sub-menu::before {
  content: '';
  position: absolute;
  top: -0.45rem;
  right: 1.1rem;
  height: 0.75rem;
  width: 0.75rem;
  background-color: var(--bg-color);
  border-top: 1px solid var(--border-color);
  border-left: 1px solid var(--border-color);
  transform: rotate(45deg);
  z-index: 10;
  opacity: 1;
  transition-delay: 0.3s;
}
</style>
