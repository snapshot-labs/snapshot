<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: string;
  }>(),
  { size: 'base' }
);
</script>

<template>
  <div :class="['relative -z-10 h-[44px] w-[40px]', size]">
    <div class="hexagon top-[7px]"></div>
    <BaseIcon
      name="snapshot"
      size="58"
      class="absolute -left-[9px] top-0 text-snapshot"
    />
  </div>
</template>

<style lang="scss">
.lg {
  height: 72px !important;
  width: 64px !important;

  i {
    font-size: 86px !important;
    line-height: 86px !important;
    left: -11px;
  }
}

.hexagon {
  position: relative;
  height: 100%;
  width: 100%;
  /* We cut the element in an hexagonal shape */
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
}

.hexagon::after {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  content: '';
  background: var(--border-color);
  clip-path: polygon(
    /* We first go around the pseudo element to recreate the hexagon */ 50% 0%,
    100% 25%,
    100% 75%,
    50% 100%,
    0% 75%,
    0% 25%,
    /* We make sure to close the hexagon and go back to the start */ 50% 0%,
    /* We then go down inside the hexagon (feel free to change the border size, here it is of 5px)*/
      50% 6px,
    /* We finally go around the pseudo element in reverse to carve a smaller hexagon inside */
      /* 0.49999999999999994 is sin(30deg) as it's only supported in Safari for now */
      6px calc(25% + 6px * 0.49999999999999994),
    6px calc(75% + 6px * -0.49999999999999994),
    50% calc(100% - 6px),
    calc(100% - 6px) calc(75% + 6px * -0.49999999999999994),
    calc(100% - 6px) calc(25% + 6px * 0.49999999999999994),
    50% 6px
  );
}
</style>
