<script setup>
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
  <TuneBlock>
    <div class="flex flex-col items-center">
      <div>
        <a :href="halUrl" target="_blank">
          <img
            class="mx-auto mb-2 rounded-full border-2 border-transparent hover:border-white"
            :src="halLogoUrl"
            alt="Hal"
            width="100"
            height="100"
          />
        </a>
      </div>
      <div class="mb-2 text-center text-skin-link">
        {{ $t('hal.text', { space: space.name }) }}
      </div>
      <a :href="halUrl" target="_blank">
        <TuneButton tabindex="-1">Be notified</TuneButton>
      </a>
    </div>
  </TuneBlock>
</template>
