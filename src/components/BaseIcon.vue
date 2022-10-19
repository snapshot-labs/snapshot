<script setup lang="ts">
import coingeckoIcon from '@/assets/icons/coingecko.svg';

withDefaults(
  defineProps<{
    name: string;
    size?: string;
  }>(),
  {
    name: '',
    size: '16'
  }
);
</script>

<template>
  <template v-if="name === 'coingecko'">
    <img :src="coingeckoIcon" alt="coingecko" class="coingecko" />
  </template>
  <template v-else>
    <i
      class="iconfont"
      :class="`icon${name}`"
      :style="size ? `font-size: ${size}px; line-height: ${size}px;` : ''"
    />
  </template>
</template>

<style scoped lang="scss">
.coingecko {
  width: 18px;
}
</style>
