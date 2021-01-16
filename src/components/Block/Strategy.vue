<template>
  <router-link :to="fromModal ? {} : `/strategy/${strategy.key}`">
    <Block>
      <div class="d-flex flex-items-baseline">
        <h3>
          {{ strategy.key }}
        </h3>
        <div class="ml-1">v{{ strategy.version }}</div>
      </div>
      <div>
        <div>
          <div class="text-gray">
            <Icon name="github" class="mr-1" />
            {{ strategy.author }}
          </div>
        </div>
        <div>In {{ _numeral(strategy.spaces.length) }} space(s)</div>
      </div>
    </Block>
  </router-link>
</template>

<script>
export default {
  props: ['strategy', 'fromModal']
};
</script>
