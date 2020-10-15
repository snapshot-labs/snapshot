<template>
  <div>
    <div class="mb-4 mx-auto">
      <Container class="d-flex flex-items-center">
        <div class="flex-auto text-left">
          <UiButton class="pl-3 col-12 col-lg-4">
            <Search v-model="q" placeholder="Search" />
          </UiButton>
        </div>
        <div class="ml-3 text-right hide-sm">
          {{ _numeral(strategies.length) }} strategie(s)
          <a
            href="https://discord.snapshot.page"
            target="_blank"
            class="hide-md ml-3"
          >
            <UiButton>Create strategy</UiButton>
          </a>
        </div>
      </Container>
    </div>
    <Container :slim="true">
      <div
        v-infinite-scroll="loadMore"
        infinite-scroll-distance="0"
        class="overflow-hidden"
      >
        <Block
          v-for="strategy in strategies.slice(0, limit)"
          :key="strategy.key"
          class="mb-3"
        >
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
      </div>
    </Container>
  </div>
</template>

<script>
import strategies from '@/helpers/strategies';

export default {
  data() {
    return {
      q: '',
      limit: 8
    };
  },
  computed: {
    strategies() {
      return Object.values(strategies)
        .map(strategy => {
          strategy.spaces = Object.entries(this.app.spaces)
            .filter(
              space =>
                space[1].strategies &&
                space[1].strategies
                  .map(strategy => strategy[0])
                  .includes(strategy.key)
            )
            .map(space => space[0]);
          return strategy;
        })
        .filter(strategy =>
          JSON.stringify(strategy)
            .toLowerCase()
            .includes(this.q.toLowerCase())
        )
        .sort((a, b) => b.spaces.length - a.spaces.length);
    }
  },
  methods: {
    loadMore() {
      this.limit += 8;
    }
  }
};
</script>
