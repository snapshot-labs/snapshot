<script setup>
import { n } from '@/helpers/utils';

defineProps(['network']);

function getLogoUrl(key) {
  return `https://raw.githubusercontent.com/snapshot-labs/snapshot.js/master/src/networks/${key}.png`;
}
</script>

<template>
  <Block class="hover-border">
    <div class="flex items-center mb-1">
      <UiAvatar
        class="mr-2 mb-2"
        :imgsrc="getLogoUrl(network.key)"
        :seed="network.key"
        size="28"
      />
      <h3 v-text="network.name" />
      <div v-text="network.key" class="ml-1 text-color" />
    </div>
    <div class="text-color">
      {{ $tc('inSpaces', [n(network.spaces)]) }}
    </div>
  </Block>
</template>
