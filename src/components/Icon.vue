<template>
  <i
    class="iconfont"
    :class="`icon${name} text-${color}`"
    :style="size ? `font-size: ${size}px; line-height: ${size}px;` : ''"
  />
</template>

<script>
export default {
  props: ['name', 'size', 'color']
};
</script>

<style scoped lang="scss">
.iconfont {
  font-size: 16px;
  line-height: 16px;
  vertical-align: baseline;
}
</style>
