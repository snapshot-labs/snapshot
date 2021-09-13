<script>
export default {
  props: ['skin']
};
</script>

<template>
  <div :class="skin.key" class="bg-black rounded-none md:rounded-md">
    <Block>
      <UiButton class="button--submit mb-2">{{ skin.key }}</UiButton>
      <div class="text-color">
        {{ $tc('inSpaces', [_n(skin.spaces)]) }}
      </div>
    </Block>
  </div>
</template>
