<template>
  <Block>
    <div class="d-flex flex-items-center mb-1">
      <a
        :href="`https://github.com/snapshot-labs/snapshot.js/tree/master/src/validations/${validation.name}/index.ts`"
        target="_blank"
        class="d-flex"
      >
        <h3 v-text="validation.name" />
      </a>
    </div>
    <div class="text-gray">
      {{ $tc('inSpaces', [_n(validation.spaces.length)]) }}
    </div>
  </Block>
</template>

<script>
export default {
  props: ['validation']
};
</script>
