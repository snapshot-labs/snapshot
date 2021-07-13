<script>
export default {
  props: ['strategy']
};
</script>

<template>
  <Block>
    <div class="d-flex flex-items-baseline">
      <h3>
        {{ strategy.key }}
      </h3>
      <div class="ml-1">v{{ strategy.version }}</div>
    </div>
    <div class="text-gray">
      <Icon name="github" class="mr-1" />
      {{ strategy.author }}
    </div>
    <div>{{ $tc('inSpaces', [_n(strategy.spaces.length)]) }}</div>
  </Block>
</template>
