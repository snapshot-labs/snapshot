<script>
export default {
  props: ['validation']
};
</script>

<template>
  <Block>
    <div class="d-flex flex-items-center mb-1">
      <h3 v-text="validation.name" />
    </div>
    <div class="text-color">
      {{ $tc('inSpaces', [_n(validation.spaces.length)]) }}
    </div>
  </Block>
</template>
