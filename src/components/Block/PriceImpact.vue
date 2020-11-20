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
        {{ this.predictPriceImpact.toFixed(2) }}%
      </a>
    </div>
    <div class="mb-1">
      <b>Option 1: </b>
      <span class="float-right">
        1 {{ this.baseToken.symbol }} = {{ this.priceFirstOption.toFixed(2) }} {{ this.quoteToken.symbol }}
      </span>
    </div>
    <div class="mb-1 border-bottom bg-gray-dark rounded-top-0 rounded-md-top-2" style="padding-bottom: 12px;">
      <b>Option 2: </b>
      <span class="float-right">
        1 {{ this.baseToken.symbol }} = {{ this.priceSecondOption.toFixed(2) }} {{ this.quoteToken.symbol }}
      </span>
    </div>
    <div class="mb-1" style="padding-top: 12px;">
      <b>{{ this.baseToken.symbol }} Market</b>
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
        <b>{{ this.quoteToken.symbol }} Market</b>
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
      pricesRate: [], 
      fixedProductMarketMakers: {},
      priceFirstOption: 0.00,
      priceSecondOption: 0.00,
      predictPriceImpact: 0.00,


    };
  },
  async created () {
    this.baseToken = await this.plugin.getTokenInfo(this.$auth.web3, this.payload.metadata.plugins.gnosis.baseTokenAddress);
    this.quoteToken = await this.plugin.getTokenInfo(this.$auth.web3, this.payload.metadata.plugins.gnosis.quoteCurrencyAddress);
    this.pricesRate = await this.plugin.getTokenPrices([this.baseToken.address, this.quoteToken.address]);
    const conditionQuery = await this.plugin.getSubgrapInfo(this.web3.network.key, this.payload.metadata.plugins.gnosis.conditionId);
    this.fixedProductMarketMakers = conditionQuery.condition.fixedProductMarketMakers;
    if (this.fixedProductMarketMakers.length < 2) {
      throw new Error(`The conditon id ${conditionId} has not two Product Market Makers.`);
    }
    this.priceFirstOption = this.getBinaryPredictTokenPrice(0);
    this.priceSecondOption = this.getBinaryPredictTokenPrice(1);
    this.predictPriceImpact = (this.priceFirstOption - this.priceSecondOption) / this.priceSecondOption;
  },
  methods: {
    getLogoUrl() {
      return `https://raw.githubusercontent.com/davidalbela/snapshot.js/feature/add-pregov-omen-plugin/src/plugins/gnosis/logo.png`;
    },
      getBinaryPredictTokenPrice(index) {
      return parseFloat(this.pricesRate[this.baseToken.address]) * (
        parseFloat(this.fixedProductMarketMakers[0].outcomeTokenMarginalPrices[index]) /
        parseFloat(this.fixedProductMarketMakers[1].outcomeTokenMarginalPrices[index])
      );

    },
  },  
};
</script>
