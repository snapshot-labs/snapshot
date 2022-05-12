import { formatUnits } from '@ethersproject/units';
import snapshot from '@snapshot-labs/snapshot.js';

const API_URL = 'https://api.covalenthq.com/v1';
const API_KEY = 'ckey_2d082caf47f04a46947f4f212a8';
export const ETHER_CONTRACT = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

export async function getTokenBalances(address: string): Promise<any[] | null> {
  const tokenBalanceUrl = `${API_URL}/1/address/${address}/balances_v2/?quote-currency=USD&format=JSON&nft=false&no-nft-fetch=true&key=${API_KEY}`;
  const tokenBalances = await snapshot.utils.getJSON(tokenBalanceUrl);
  const etherItem = tokenBalances.data.items.find(
    item => item.contract_address === ETHER_CONTRACT
  );
  const tokenBalancesWithoutZero = [
    etherItem,
    ...tokenBalances.data.items.filter(
      item =>
        Number(formatUnits(item.balance || 0, item.contract_decimals || 0)) >
          0.001 && item.contract_address !== ETHER_CONTRACT
    )
  ];
  return tokenBalancesWithoutZero;
}
