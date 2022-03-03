<script setup>
import { computed } from 'vue';
const props = defineProps({
  space: Object
});
const halUrl = computed(
  () =>
    `https://9000.hal.xyz/recipes/snapshot-follow-new-proposals?space-id=${props.space.id}&status=end`
);
const halLogoUrl = computed(
  () => 'https://hal-snapshot-plugin.s3.eu-west-1.amazonaws.com/hal_bell.svg'
);
</script>

<template>
  <Block :title="$t('hal.title', { spaceName: space.name })">
    <div class="flex flex-col items-center">
      <div>
        <a :href="halUrl" target="_blank">
          <img
            class="rounded-full border-2 border-transparent hover:border-white mx-auto mb-2"
            :src="halLogoUrl"
            alt="Hal"
            width="100"
            height="100"
          />
        </a>
      </div>
      <div class="text-skin-link text-center mb-2">{{ $t('hal.text') }}</div>
      <a :href="halUrl" target="_blank">
        <UiButton>Be notified</UiButton>
      </a>
    </div>
  </Block>
</template>
