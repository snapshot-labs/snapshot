<script>
export default {
  props: ['skin']
};
</script>

<template>
  <div :class="skin.key" class="bg-black rounded-0 rounded-md-2">
    <Block>
      <UiButton class="button--submit mb-2">{{ skin.key }}</UiButton>
      <div class="text-color">
        {{ $tc('inSpaces', [_n(skin.spaces.length)]) }}
      </div>
    </Block>
  </div>
</template>
