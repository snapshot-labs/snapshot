<template>
  <Block title="Gnosis Impact">
    <div class="mb-1">
      <b>
        Predicted impact
      </b>
      <div class="float-right">
        <span :aria-label="this.baseToken.name" class="tooltipped tooltipped-n">
          <img
            class="d-inline-block v-align-middle line-height-0 circle border"
            :src="this.baseTokenUrl"
            width="22"
            height="22"
          />
        </span>
        {{ this.predictPriceImpact.toFixed(2) }}%
      </div>
    </div>
    <div class="mb-1" :title="this.choices[0]">
      <b>{{ _shorten(this.choices[0], 'name') }}</b>
      <span class="float-right">
        1
        {{ this.baseToken.symbol }}
        =
        {{ this.priceFirstOption.toFixed(2) }}
        {{ this.quoteToken.symbol }}
      </span>
    </div>
    <div
      :title="this.choices[1]"
      class="mb-1 border-bottom bg-gray-dark rounded-top-0 rounded-md-top-2"
      style="padding-bottom: 12px;"
    >
      <b>{{ _shorten(this.choices[1], 'name') }}</b>
      <span class="float-right">
        1
        {{ this.baseToken.symbol }}
        =
        {{ this.priceSecondOption.toFixed(2) }}
        {{ this.quoteToken.symbol }}
      </span>
    </div>
    <div class="mb-1" style="padding-top: 12px;">
      <b>{{ this.baseToken.symbol }} market</b>
      <a
        :href="getMarketUrl(this.baseProductMarketMaker)"
        target="_blank"
        class="float-right"
      >
        <Icon name="external-link" class="ml-1" />
      </a>
    </div>
    <div>
      <div class="mb-1">
        <b>{{ this.quoteToken.symbol }} market</b>
        <a
          :href="getMarketUrl(this.quoteProductMarketMaker)"
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
import Plugin from '@snapshot-labs/snapshot.js/src/plugins/gnosis';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';

export default {
  props: ['proposalConfig', 'choices'],
  data() {
    return {
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
    this.baseToken = await this.plugin.getTokenInfo(
      getProvider(this.web3.network.key),
      this.proposalConfig.baseTokenAddress
    );
    this.baseTokenUrl = this.getLogoUrl(this.baseToken.checksumAddress);
    this.quoteToken = await this.plugin.getTokenInfo(
      getProvider(this.web3.network.key),
      this.proposalConfig.quoteCurrencyAddress
    );
    const conditionQuery = await this.plugin.getOmenCondition(
      this.web3.network.key,
      this.proposalConfig.conditionId
    );
    this.baseProductMarketMaker = conditionQuery.condition.fixedProductMarketMakers.find(
      market => market.collateralToken === this.proposalConfig.baseTokenAddress
    );
    this.quoteProductMarketMaker = conditionQuery.condition.fixedProductMarketMakers.find(
      market => market.collateralToken === this.quoteToken.address
    );

    const tokenPairQuery = await this.plugin.getUniswapPair(
      this.web3.network.key,
      this.proposalConfig.quoteCurrencyAddress,
      this.proposalConfig.baseTokenAddress
    );
    if (tokenPairQuery.pairs.length > 0) {
      this.quoteCurrencyPrice = parseFloat(tokenPairQuery.pairs[0].token0Price);
    }
    this.priceFirstOption = this.getTokenPrice(0);
    this.priceSecondOption = this.getTokenPrice(1);
    this.predictPriceImpact =
      ((this.priceFirstOption - this.priceSecondOption) /
        this.priceSecondOption) *
      100;
  },
  methods: {
    getLogoUrl(checksumAddress) {
      return `https://gnosis-safe-token-logos.s3.amazonaws.com/${checksumAddress}.png`;
    },
    getMarketUrl(marketIndex) {
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
