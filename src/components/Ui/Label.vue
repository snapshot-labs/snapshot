<template>
  <span class="Label border !align-middle">
    <slot />
  </span>
</template>

<style scoped lang="scss">
.Label {
  display: inline-block;
  padding: 0 7px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 2em;
  box-shadow: none;
  color: var(--text-color);
}
</style>
