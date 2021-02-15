<template>
  <div :class="skin.key" class="bg-black rounded-0 rounded-md-2">
    <Block>
      <UiButton class="button--submit mb-2">{{ skin.key }}</UiButton>
      <div class="text-gray">In {{ _n(skin.spaces.length) }} space(s)</div>
    </Block>
  </div>
</template>

<script>
export default {
  props: ['skin']
};
</script>
