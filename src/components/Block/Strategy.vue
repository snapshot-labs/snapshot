<template>
  <Block>
    <div class="d-flex flex-items-baseline">
      <h3>
        <a
          v-text="strategy.key"
          :href="
            `https://github.com/snapshot-labs/snapshot.js/tree/master/src/strategies/${strategy.key}`
          "
          target="_blank"
        />
      </h3>
      <div class="ml-1">v{{ strategy.version }}</div>
    </div>
    <div>
      <div>
        <a
          :href="`https://github.com/${strategy.author}`"
          target="_blank"
          class="text-gray"
        >
          <Icon name="github" class="mr-1" />
          {{ strategy.author }}
        </a>
      </div>
      <div>In {{ _numeral(strategy.spaces.length) }} space(s)</div>
    </div>
  </Block>
</template>

<script>
export default {
  props: ['strategy']
};
</script>
