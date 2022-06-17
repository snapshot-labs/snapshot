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

  // If there is an ether item, add it to the top of the list
  const etherItem = validTokenBalances.find(
    item => item.contract_address === ETHER_CONTRACT
  );
  if (etherItem) {
    validTokenBalances.unshift(etherItem);
  }

  return validTokenBalances;
}
