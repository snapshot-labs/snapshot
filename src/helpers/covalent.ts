import snapshot from '@snapshot-labs/snapshot.js';

const API_URL = 'https://api.covalenthq.com/v1';
const API_KEY = 'ckey_2d082caf47f04a46947f4f212a8';
export const ETHER_CONTRACT = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

export async function getTokenBalances(
  address: string,
  chainId: string
): Promise<any[] | null> {
  const tokenBalanceUrl = `${API_URL}/${chainId}/address/${address}/balances_v2/?quote-currency=USD&format=JSON&nft=false&no-nft-fetch=true&key=${API_KEY}`;
  const tokenBalances = await snapshot.utils.getJSON(tokenBalanceUrl);

  const validTokenBalances = tokenBalances.data.items.filter(
    item =>
      item.contract_name &&
      item.contract_ticker_symbol &&
      item.logo_url &&
      item.quote
  );

  // If there is an ether item, move it to the top of the list
  const etherItem = validTokenBalances.find(
    item => item.contract_address === ETHER_CONTRACT
  );
  if (etherItem) {
    const index = validTokenBalances.findIndex(
      item => item.contract_address === ETHER_CONTRACT
    );
    validTokenBalances.splice(index, 1);
    validTokenBalances.unshift(etherItem);
  }

  return validTokenBalances;
}

export async function getTokenPrices(
  contract: string,
  chainId: string
): Promise<any> {
  const tokenPricesUrl = `${API_URL}/pricing/historical_by_addresses_v2/${chainId}/USD/${contract}/?quote-currency=USD&format=JSON&key=${API_KEY}`;
  return await snapshot.utils.getJSON(tokenPricesUrl);
}
