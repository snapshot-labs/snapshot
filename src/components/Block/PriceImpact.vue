<template>
  <Block title="Gnosis Impact">
    <div class="mb-1">
      <b>
        Predicted Impact
      </b>
      <a
        :href="_explorer(space.network, payload.snapshot, 'block')"
        target="_blank"
        class="float-right"
      >
        <span :aria-label="symbol" class="tooltipped tooltipped-n">
          <Token :space="space.key" :symbolIndex="symbolIndex" />
        </span>
        51%
      </a>
    </div>
    <div class="mb-1">
      <b>Option 1: </b>
      <span class="float-right">
        1 GNO = 70 Dai
      </span>
    </div>
    <div class="mb-1 border-bottom bg-gray-dark rounded-top-0 rounded-md-top-2" style="padding-bottom: 12px;">
      <b>Option 2: </b>
      <span class="float-right">
        1 GNO = 54 Dai
      </span>
    </div>
    <div class="mb-1" style="padding-top: 12px;">
      <b>GNO Market</b>
      <a
        :href="_ipfsUrl(id)"
        target="_blank"
        class="float-right"
      >
        <Icon name="external-link" class="ml-1" />
      </a>
    </div>
    <div>
      <div class="mb-1">
        <b>Dai Market</b>
        <a
          :href="_ipfsUrl(id)"
          target="_blank"
          class="float-right"
        >
          <Icon name="external-link" class="ml-1" />
        </a>
      </div>
    </div>
  </Block>
</template>

<script>

export default {
  props: ['id', 'space', 'payload', 'results', 'votes'],
  computed: {
    ts() {
      return (Date.now() / 1e3).toFixed();
    },
    titles() {
      return this.space.strategies.map(strategy => strategy.params.symbol);
    }
  },
  methods: {
    async downloadReport() {
      console.log("hello");
    }
  }
};
</script>
