<script setup>
const props = defineProps({
  space: Object
});

const getSpaceId = () => {
  const spaceId = props.space.id;
  return spaceId;
};

const getSpaceName = () => {
  const spaceName = props.space.name;
  return spaceName;
};

const getHalUrl = () => {
  const spaceId = getSpaceId();
  return `https://9000.staging.hal.xyz/recipes/snapshot-follow-new-proposals?space-id=${spaceId}&status=end`;
};

const getLogoUrl = () => {
  return `https://hal-snapshot-plugin.s3.eu-west-1.amazonaws.com/hal_bell.svg`;
};
</script>

<template>
  <Block
    :title="$t('hal.title', { spaceName: getSpaceName() })"
    :loading="loading"
  >
    <div class="flex flex-col items-center">
      <div>
        <a :href="getHalUrl()" target="_blank">
          <img
            class="
              rounded-full
              border-2 border-transparent
              hover:border-white
              mx-auto
              mb-2
            "
            :src="getLogoUrl()"
            alt="Hal"
            width="100"
            height="100"
          />
        </a>
      </div>
      <div class="link-color text-center mb-2">{{ $t('hal.text') }}</div>
      <a :href="getHalUrl()" target="_blank">
        <UiButton>Be notified</UiButton>
      </a>
    </div>
  </Block>
</template>
