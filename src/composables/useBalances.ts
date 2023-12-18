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

  async function loadBalances(address: string, networkId: number) {
    try {
      loading.value = true;

      const baseToken = {
        ...CHAIN_CURRENCIES[networkId],
        tokenBalance: '',
        price: 0,
        change: 0,
        value: 0
      };

      if (!address) return (tokens.value = [baseToken]);

      const data = await getBalances(address, networkId, baseToken);
      const tokensWithBalance = data.filter(
        asset =>
          formatUnits(asset.tokenBalance, asset.decimals) !== '0.0' ||
          asset.symbol === baseToken.symbol
      );

      const coingeckoAssetPlatform = COINGECKO_ASSET_PLATFORMS[networkId];
      const coingeckoBaseAsset = COINGECKO_BASE_ASSETS[networkId];

      const coins =
        coingeckoBaseAsset && coingeckoAssetPlatform
          ? await getCoins(
              coingeckoAssetPlatform,
              coingeckoBaseAsset,
              tokensWithBalance
                .filter(asset => asset.contractAddress !== ETH_CONTRACT)
                .map(token => token.contractAddress)
            )
          : [];

      tokens.value = tokensWithBalance.map(asset => {
        if (!coins[asset.contractAddress]) return asset;

        const price = coins[asset.contractAddress]?.usd || 0;
        const change = coins[asset.contractAddress]?.usd_24h_change || 0;
        const value =
          parseFloat(formatUnits(asset.tokenBalance, asset.decimals)) * price;

        loaded.value = true;

        return {
          ...asset,
          price,
          change,
          value
        };
      });
    } catch (e) {
      console.log(e);
    } finally {
      loading.value = false;
    }
  }

  const assetsMap = computed(
    () => new Map(tokens.value.map(asset => [asset.contractAddress, asset]))
  );

  return { loading, loaded, tokens, assetsMap, loadBalances };
}
