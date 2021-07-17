<script setup>
import { ref, onBeforeUnmount, onMounted } from 'vue';

const sticky = ref(null);
const isFixed = ref(false);
const offsetTop = ref(-1);
const offsetHeight = ref(0);

function onScroll(e) {
  const windowTop = e.target.documentElement.scrollTop;
  isFixed.value = windowTop >= offsetTop.value;
}

onMounted(() => {
  window.addEventListener('scroll', onScroll);
  if (sticky.value) {
    offsetTop.value = sticky.value.offsetTop;
    offsetHeight.value = sticky.value.offsetHeight;
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
});
</script>

<template>
  <div>
    <div v-if="isFixed" :style="`height: ${offsetHeight}px;`" />
    <div
      style="z-index: 20"
      ref="sticky"
      :class="{ 'position-fixed width-full top-0': isFixed }"
    >
      <slot />
    </div>
  </div>
</template>
