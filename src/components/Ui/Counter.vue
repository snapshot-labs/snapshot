<template>
  <span v-if="counter > 0 || override" v-text="counter" class="Counter" />
</template>

<script>
export default {
  props: {
    counter: [Number, String],
    override: Boolean
  }
};
</script>

<style scoped lang="scss">
.Counter {
  display: inline-block;
  font-weight: 500;
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
