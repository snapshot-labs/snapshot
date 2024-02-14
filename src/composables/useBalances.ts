import { formatUnits } from '@ethersproject/units';
import { getBalances, GetBalancesResponse } from '@/helpers/alchemy';
import {
  ETH_CONTRACT,
  COINGECKO_ASSET_PLATFORMS,
  COINGECKO_BASE_ASSETS,
  CHAIN_CURRENCIES,
  ChainCurrency
} from '@/helpers/constants';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple';
const COINGECKO_PARAMS = '&vs_currencies=usd&include_24hr_change=true';

export function useBalances() {
  const tokens = ref<GetBalancesResponse>([]);
  const loading = ref(true);
  const loaded = ref(false);

  async function callCoinGecko(apiUrl: string): Promise<any> {
    const response = await fetch(apiUrl);
    return response.json();
  }

  async function getCoins(
    assetPlatform: string,
    baseToken: string,
    contractAddresses: string[]
  ): Promise<Record<string, any>> {
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

  function filterValidTokens(
    data: GetBalancesResponse,
    baseToken: ChainCurrency
  ): GetBalancesResponse {
    return data.filter(
      asset =>
        formatUnits(asset.tokenBalance, asset.decimals) !== '0.0' ||
        asset.symbol === baseToken.symbol
    );
  }

  function getCoinGeckoConfig(networkId: string): {
    coingeckoAssetPlatform: string;
    coingeckoBaseAsset: string;
  } {
    return {
      coingeckoAssetPlatform: COINGECKO_ASSET_PLATFORMS[networkId],
      coingeckoBaseAsset: COINGECKO_BASE_ASSETS[networkId]
    };
  }

  async function fetchCoinPrices(
    coingeckoAssetPlatform: string,
    coingeckoBaseAsset: string,
    tokensWithBalance: GetBalancesResponse
  ): Promise<Record<string, any>> {
    if (!coingeckoBaseAsset || !coingeckoAssetPlatform) return {};

    const contractAddresses = tokensWithBalance
      .filter(asset => asset.contractAddress !== ETH_CONTRACT)
      .map(token => token.contractAddress);

    return getCoins(
      coingeckoAssetPlatform,
      coingeckoBaseAsset,
      contractAddresses
    );
  }

  function mapTokenValues(
    tokensWithBalance: GetBalancesResponse,
    coins: Record<string, any>
  ): GetBalancesResponse {
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

  async function loadBalances(
    address: string,
    networkId: string
  ): Promise<void> {
    try {
      loading.value = true;
      tokens.value = [];
      const baseToken = CHAIN_CURRENCIES[networkId];
      const data = await getBalances(address, Number(networkId), baseToken);

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
