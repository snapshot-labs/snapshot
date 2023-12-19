import { formatUnits } from '@ethersproject/units';
import { getBalances, GetBalancesResponse } from '@/helpers/alchemy';
import { CHAIN_CURRENCIES } from '@/helpers/constants';
import {
  ETH_CONTRACT,
  COINGECKO_ASSET_PLATFORMS,
  COINGECKO_BASE_ASSETS
} from '@/helpers/constants';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple';
const COINGECKO_PARAMS = '&vs_currencies=usd&include_24hr_change=true';

export function useBalances() {
  const tokens: Ref<GetBalancesResponse> = ref([]);
  const loading = ref(true);
  const loaded = ref(false);

  async function callCoinGecko(apiUrl: string) {
    const res = await fetch(apiUrl);
    return res.json();
  }

  async function getCoins(
    assetPlatform: string,
    baseToken: string,
    contractAddresses: string[]
  ) {
    const [baseTokenData, tokenData] = await Promise.all([
      callCoinGecko(
        `${COINGECKO_API_URL}/price?ids=${baseToken}${COINGECKO_PARAMS}`
      ),
      callCoinGecko(
        `${COINGECKO_API_URL}/token_price/${assetPlatform}?contract_addresses=${contractAddresses.join(
          ','
        )}${COINGECKO_PARAMS}`
      )
    ]);

    return {
      [ETH_CONTRACT]: baseTokenData[baseToken],
      ...tokenData
    };
  }

  function filterValidTokens(data, baseToken) {
    return data.filter(
      asset =>
        formatUnits(asset.tokenBalance, asset.decimals) !== '0.0' ||
        asset.symbol === baseToken.symbol
    );
  }

  function getCoinGeckoConfig(networkId) {
    return {
      coingeckoAssetPlatform: COINGECKO_ASSET_PLATFORMS[networkId],
      coingeckoBaseAsset: COINGECKO_BASE_ASSETS[networkId]
    };
  }

  async function fetchCoinPrices(assetPlatform, baseToken, tokensWithBalance) {
    if (!baseToken || !assetPlatform) return [];

    const contractAddresses = tokensWithBalance
      .filter(asset => asset.contractAddress !== ETH_CONTRACT)
      .map(token => token.contractAddress);

    return getCoins(assetPlatform, baseToken, contractAddresses);
  }

  function mapTokenValues(tokensWithBalance, coins) {
    return tokensWithBalance.map(asset => {
      const coinData = coins[asset.contractAddress];
      if (!coinData) return asset;

      const price = coinData.usd || 0;
      const change = coinData.usd_24h_change || 0;
      const value =
        parseFloat(formatUnits(asset.tokenBalance, asset.decimals)) * price;

      return {
        ...asset,
        price,
        change,
        value
      };
    });
  }

  async function loadBalances(address, networkId) {
    try {
      loading.value = true;
      const baseToken = { ...CHAIN_CURRENCIES[networkId] };
      const data = await getBalances(address, networkId, baseToken);

      const tokensWithBalance = filterValidTokens(data, baseToken);
      const { coingeckoAssetPlatform, coingeckoBaseAsset } =
        getCoinGeckoConfig(networkId);

      const coins = await fetchCoinPrices(
        coingeckoAssetPlatform,
        coingeckoBaseAsset,
        tokensWithBalance
      );
      tokens.value = mapTokenValues(tokensWithBalance, coins);

      loaded.value = true;
    } catch (error) {
      console.error('Error loading balances:', error);
    } finally {
      loading.value = false;
    }
  }

  const assetsMap = computed(
    () => new Map(tokens.value.map(asset => [asset.contractAddress, asset]))
  );

  return { loading, loaded, tokens, assetsMap, loadBalances };
}
