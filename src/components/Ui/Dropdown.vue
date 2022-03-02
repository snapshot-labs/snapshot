<script setup>
import { ref, onBeforeUnmount, computed } from 'vue';

const props = defineProps({
  items: Array,
  top: String,
  right: String,
  subMenuWrapperRight: String,
  hideDropdown: Boolean
});

const emit = defineEmits(['select', 'clickedNoDropdown']);

const open = ref(false);
const dropdownEl = ref(null);

const cssVars = computed(() => {
  return {
    '--top': props.top,
    '--right': props.right,
    '--submenu-wrapper-right': props.subMenuWrapperRight || 0
  };
});

function handleClick(action) {
  emit('select', action);
  open.value = false;
}

function close(e) {
  if (!dropdownEl.value.contains(e.target)) {
    open.value = false;
  }
}

window.addEventListener('click', close);

onBeforeUnmount(() => window.removeEventListener('click', close));
</script>

<template>
  <div
    ref="dropdownEl"
    @click.capture="hideDropdown ? $emit('clickedNoDropdown') : (open = !open)"
    class="relative h-full"
  >
    <div class="button flex items-center h-full">
      <slot />
    </div>
    <div class="sub-menu-wrapper" :class="{ hidden: !open }" :style="cssVars">
      <ul class="sub-menu my-2">
        <li
          v-for="item in items"
          :key="item"
          @click="handleClick(item.action)"
          :class="{ selected: item.selected }"
          class="list-none block whitespace-nowrap px-[18px] py-[2px]"
        >
          <slot name="item" :item="item" :key="item">
            {{ item.text }}
          </slot>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
.button {
  cursor: pointer;
  &:hover {
    color: var(--link-color);
  }
}

li {
  line-height: 34px;
  cursor: pointer;
}

li.disabled {
  cursor: not-allowed;
}

li.selected,
li:hover {
  background-color: var(--border-color);
  color: var(--link-color);
}

.sub-menu-wrapper {
  position: absolute;
  right: var(--submenu-wrapper-right);
  top: var(--top);
  width: auto;
  background-color: var(--header-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 0 20px -6px var(--border-color);
  z-index: 1;
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
