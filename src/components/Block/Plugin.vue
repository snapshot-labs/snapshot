<script setup>
defineProps(['plugin', 'selected']);

function getLogoUrl(key) {
  return `https://raw.githubusercontent.com/snapshot-labs/snapshot-plugins/master/src/plugins/${key}/logo.png`;
}
</script>

<template>
  <Block 
    :class="[
      'transition-colors relative plugin',
      { 'plugin-active': selected }
    ]"
  >
    <i
      v-if="selected"
      class="iconfont iconcheck1 absolute top-2 right-2 text-lg"
    />
    <div class="flex items-center mb-1">
      <a
        :href="`https://github.com/snapshot-labs/snapshot-plugins/tree/master/src/plugins/${plugin.key}`"
        target="_blank"
        class="flex items-center"
      >
        <UiAvatar
          class="mr-2 mb-2"
          :imgsrc="getLogoUrl(plugin.key)"
          :seed="plugin.name.charCodeAt()"
          size="28"
        />
        <h3 v-text="plugin.name" />
      </a>
      <div class="ml-1 text-color">v{{ plugin.version }}</div>
    </div>
    <div class="text-color">
      <div>
        <a
          :href="`https://github.com/${plugin.author}`"
          target="_blank"
          class="text-color"
        >
          <Icon name="github" class="mr-1" />
          {{ plugin.author }}
        </a>
      </div>
      {{ $tc('inSpaces', [_n(plugin.spaces)]) }}
    </div>
  </Block>
</template>

<style scoped lang="scss">
.plugin {
  &:hover,
  &.plugin-active {
    border-color: var(--link-color);
  }
}
</style>
