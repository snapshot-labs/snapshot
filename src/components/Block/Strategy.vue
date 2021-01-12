<template>
  <Block>
    <div class="d-flex flex-items-baseline">
      <h3>
        <router-link
          :to="`/strategy/${strategy.key}`"
          :target="fromModal ? '_blank' : '_self'"
        >
          {{ strategy.key }}
        </router-link>
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
  props: ['strategy', 'fromModal']
};
</script>
