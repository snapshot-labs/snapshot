<script setup>
defineProps({
  counter: [Number, String]
});
</script>

<template>
  <div
    v-if="counter > 0 || typeof counter === 'string'"
    v-text="counter"
    class="count h-[20px] min-w-[20px] leading-[20px] px-1 rounded-full"
  />
</template>

<style scoped lang="scss">
.count {
  color: white;
  background-color: var(--text-color);
  font-size: 13px;
}
</style>
