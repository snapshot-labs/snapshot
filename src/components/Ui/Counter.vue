<script setup>
defineProps({
  counter: [Number, String]
});
</script>

<template>
  <div
    v-if="counter > 0 || typeof counter === 'string'"
    v-text="_n(counter, '0,0')"
    class="count h-[20px] min-w-[20px] leading-6 px-1 rounded-full"
  />
</template>

<style scoped lang="scss">
.count {
  color: white;
  text-align: center;
  background-color: var(--text-color);
  vertical-align: middle;
  font-size: 13px;
}
</style>
