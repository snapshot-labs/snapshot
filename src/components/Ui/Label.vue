<template>
  <span class="Label border v-align-middle">
    <slot />
  </span>
</template>

<style scoped lang="scss">
@import '../../vars';

.label,
.Label {
  border-radius: 2em;
  color: $white;
  padding: 0 7px;
  line-height: 18px;
}
</style>
