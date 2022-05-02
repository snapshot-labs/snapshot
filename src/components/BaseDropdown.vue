<script setup lang="ts">
import { ref, onBeforeUnmount, watch } from 'vue';

defineProps<{
  items:
    | {
        action: string | any;
        text: string;
      }
    | Record<string, any>[];
}>();

const emit = defineEmits(['select', 'openChange']);

const open = ref(false);
const dropdownEl = ref<any>(null);
const positionClass = ref('');

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

watch(open, () => {
  const { left, right } = dropdownEl.value.getBoundingClientRect();
  positionClass.value =
    left < window.innerWidth - right
      ? 'origin-top-left left-0'
      : 'origin-top-right right-0';
  emit('openChange');
});
</script>

<template>
  <div ref="dropdownEl" class="relative inline-block text-left h-full">
    <div
      @click="open = !open"
      class="inline-flex items-center w-full h-full cursor-pointer"
    >
      <slot name="button" />
    </div>

    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        :class="positionClass"
        class="z-20 absolute mt-2 max-w-[320px] md:max-w-[400px] rounded-2xl bg-skin-header-bg overflow-hidden shadow-lg border border-skin-border"
        v-if="open"
      >
        <ul
          class="max-h-[85vh] overflow-y-auto no-scrollbar overscroll-contain"
        >
          <slot name="header" />
          <li
            v-for="item in items"
            :key="item.text"
            @click.stop="handleClick(item.action)"
            :class="{ selected: item.selected }"
            class="list-none block whitespace-nowrap px-3 py-2 cursor-pointer select-none group"
          >
            <slot name="item" :item="item" :key="item">
              {{ item.text }}
            </slot>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
li.selected,
li:hover {
  @apply bg-skin-border;
}
</style>
