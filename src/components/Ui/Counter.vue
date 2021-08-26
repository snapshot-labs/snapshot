<script setup>
defineProps({
  counter: [Number, String]
});
</script>

<template>
  <span
    v-if="counter > 0 || typeof counter === 'string'"
    v-text="counter"
    class="Counter"
  />
</template>

<style scoped lang="scss">
.Counter {
  display: inline-block;
  line-height: 18px;
  height: 20px;
  min-width: 20px;
  color: var(--bg-color);
  text-align: center;
  background-color: var(--text-color);
  border-radius: 10px;
  vertical-align: middle;
}
</style>
