<script setup>
defineProps({
  name: String,
  size: String
});
</script>

<template>
  <i
    class="iconfont"
    :class="`icon${name}`"
    :style="size ? `font-size: ${size}px; line-height: ${size}px;` : ''"
  />
</template>

<style scoped lang="scss">
.iconfont {
  font-size: 16px;
  line-height: 16px;
  vertical-align: baseline;
}
</style>
