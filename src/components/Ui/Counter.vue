<template>
  <span v-if="counter > 99" v-text="'99+'" class="Counter" />
  <span v-else-if="counter > 0" v-text="counter" class="Counter" />
</template>

<script>
export default {
  props: {
    counter: Number
  }
};
</script>

<style scoped lang="scss">
.Counter {
  display: inline-block;
  line-height: 18px;
  height: 20px;
  min-width: 20px;
  color: white;
  text-align: center;
  background-color: var(--text-color);
  border-radius: 10px;
  vertical-align: middle;
}
</style>
