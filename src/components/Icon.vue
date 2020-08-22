<template>
  <i
    class="iconfont"
    :class="`icon${name}`"
    :style="size ? `font-size: ${size}px; line-height: ${size}px;` : ''"
  />
</template>

<script>
export default {
  props: ['name', 'size']
};
</script>

<style scoped lang="scss">
.iconfont {
  font-size: 16px;
  line-height: 16px;
  vertical-align: baseline;
}
</style>
