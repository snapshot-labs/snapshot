<script setup>
import { computed, defineProps } from 'vue';
import { formatBytes32String } from '@ethersproject/strings';
import { getUrl } from '@snapshot-labs/snapshot.js/src/utils.ts';

const props = defineProps({
  space: Object,
  size: String,
  symbolIndex: [String, Number]
});

const spaceId = computed(() => props.space.id ?? props.space.key);

const url = computed(() => {
  const file = props.symbolIndex
    ? props.symbolIndex === 'space'
      ? 'space'
      : `logo${props.symbolIndex}`
    : 'logo';

  const url =
    getUrl(props.space.avatar) ??
    `https://raw.githubusercontent.com/snapshot-labs/snapshot-spaces/master/spaces/${spaceId.value}/${file}.png`;

  return `https://worker.snapshot.org/mirror?img=${encodeURIComponent(url)}`;
});

const spaceAddress = computed(() => {
  if (spaceId.value) return formatBytes32String(spaceId.value.slice(0, 24));
  return '';
});
</script>

<template>
  <span class="d-inline-block v-align-middle line-height-0">
    <UiAvatar :imgsrc="url" :address="spaceAddress" :size="size" />
  </span>
</template>
