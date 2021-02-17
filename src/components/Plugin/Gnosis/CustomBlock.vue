<template>
  <Block title="Gnosis Impact">
    <div v-if="choices.length > 1">
      <div v-if="loading" class="loading">
        Loading...
      </div>
      <div class="mb-1">
        <b>
          Predicted impact
        </b>
        <div class="float-right">
          <span :aria-label="baseToken.name" class="tooltipped tooltipped-n">
            <img
              class="d-inline-block v-align-middle line-height-0 circle border"
              :src="baseTokenUrl"
              width="22"
              height="22"
            />
          </span>
          {{ predictPriceImpact.toFixed(2) }}%
        </div>
      </div>
      <div class="mb-1" :title="choices[0]">
        <b>{{ _shorten(choices[0], 'name') }}</b>
        <span class="float-right">
          1
          {{ baseToken.symbol }}
          =
          {{ priceFirstOption.toFixed(2) }}
          {{ quoteToken.symbol }}
        </span>
      </div>
      <div
        :title="choices[1]"
        class="mb-1 border-bottom bg-gray-dark rounded-top-0 rounded-md-top-2"
        style="padding-bottom: 12px;"
      >
        <b>{{ _shorten(choices[1], 'name') }}</b>
        <span class="float-right">
          1
          {{ baseToken.symbol }}
          =
          {{ priceSecondOption.toFixed(2) }}
          {{ quoteToken.symbol }}
        </span>
      </div>
      <div class="mb-1" style="padding-top: 12px;">
        <b>{{ baseToken.symbol }} market</b>
        <a
          :href="getMarketUrl(baseProductMarketMaker)"
          target="_blank"
          class="float-right"
        >
          <Icon name="external-link" class="ml-1" />
        </a>
      </div>
      <div>
        <div class="mb-1">
          <b>{{ quoteToken.symbol }} market</b>
          <a
            :href="getMarketUrl(quoteProductMarketMaker)"
            target="_blank"
            class="float-right"
          >
            <Icon name="external-link" class="ml-1" />
          </a>
        </div>
      </div>
    </div>
    <div v-else>
      Two choices are required for this plugin.
    </div>
  </Block>
</template>

<script>
import Plugin from '@snapshot-labs/snapshot.js/src/plugins/gnosis';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';

export default {
  props: ['proposalConfig', 'choices'],
  data() {
    return {
      loading: false,
      plugin: new Plugin(),
      baseToken: {},
      baseTokenUrl: '',
      quoteToken: {},
      baseProductMarketMaker: {},
      quoteProductMarketMaker: {},
      quoteCurrencyPrice: 0.0,
      priceFirstOption: 0.0,
      priceSecondOption: 0.0,
      predictPriceImpact: 0.0
    };
  },
  async created() {
    this.loading = true;
    const provider = getProvider(this.proposalConfig.network);
    this.baseToken = await this.plugin.getTokenInfo(
      provider,
      this.proposalConfig.baseTokenAddress
    );
    this.baseTokenUrl = this.getLogoUrl(this.baseToken.checksumAddress);
    this.quoteToken = await this.plugin.getTokenInfo(
      provider,
      this.proposalConfig.quoteCurrencyAddress
    );
    const conditionQuery = await this.plugin.getOmenCondition(
      this.proposalConfig.network,
      this.proposalConfig.conditionId
    );
    this.baseProductMarketMaker = conditionQuery.condition.fixedProductMarketMakers.find(
      market => market.collateralToken === this.proposalConfig.baseTokenAddress
    );
    this.quoteProductMarketMaker = conditionQuery.condition.fixedProductMarketMakers.find(
      market => market.collateralToken === this.quoteToken.address
    );

    const tokenPairQuery = await this.plugin.getUniswapPair(
      this.proposalConfig.network,
      this.proposalConfig.quoteCurrencyAddress,
      this.proposalConfig.baseTokenAddress
    );
    if (
      tokenPairQuery !== undefined &&
      tokenPairQuery.token0Price !== undefined
    ) {
      this.quoteCurrencyPrice = parseFloat(tokenPairQuery.token0Price);
    }
    this.priceFirstOption = this.getTokenPrice(0);
    this.priceSecondOption = this.getTokenPrice(1);
    this.predictPriceImpact =
      ((this.priceFirstOption - this.priceSecondOption) /
        this.priceSecondOption) *
      100;
    this.loading = false;
  },
  methods: {
    getLogoUrl(checksumAddress) {
      return `https://gnosis-safe-token-logos.s3.amazonaws.com/${checksumAddress}.png`;
    },
    getMarketUrl(marketIndex) {
      if (this.proposalConfig.network === "100") {
        return `https://xdai.omen.eth.link/#/${marketIndex.id}`;
      }
      return `https://omen.eth.link/#/${marketIndex.id}`;
    },
    getTokenPrice(outcomeIndex) {
      return (
        this.quoteCurrencyPrice *
        (parseFloat(
          this.baseProductMarketMaker.outcomeTokenMarginalPrices[outcomeIndex]
        ) /
          parseFloat(
            this.quoteProductMarketMaker.outcomeTokenMarginalPrices[
              outcomeIndex
            ]
          ))
      );
    }
  }
};
</script>
