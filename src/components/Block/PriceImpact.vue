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
        <span :aria-label="space.name" class="tooltipped tooltipped-n">
          <img class="d-inline-block v-align-middle line-height-0 circle border" :src="getLogoUrl()" width="22" height="22"/>
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
import gnosisPlugin from '@snapshot-labs/snapshot.js/src/plugins/gnosis';

export default {
  props: ['id', 'space', 'payload', 'results', 'votes'],
  data() {
    return {
      plugin: new gnosisPlugin(),
      baseToken: {},
      quoteToken: {},
      fixedProductMarketMaker: {}
    };
  },
  created() {
    this.plugin = new gnosisPlugin();
  },
  methods: {
    getLogoUrl() {
      return `https://raw.githubusercontent.com/davidalbela/snapshot.js/feature/add-pregov-omen-plugin/src/plugins/gnosis/logo.png`;
    },
  },
  async mounted () {
      if (this.payload.metadata.plugins.gnosis) {
        if (this.web3) {
          this.baseToken = await this.plugin.getTokenInfo(this.web3, this.payload.metadata.plugins.gnosis.baseTokenAddress);
          this.quoteToken = await this.plugin.getTokenInfo(this.web3, this.payload.metadata.plugins.gnosis.quoteCurrencyAddress);
          if (this.web3.network) {
            this.fixedProductMarketMaker = await this.plugin.getSubgrapInfo(this.web3.network.key, this.payload.metadata.plugins.gnosis.conditionId);
          }
        }
      }
  }
};
</script>
