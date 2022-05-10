import snapshot from '@snapshot-labs/snapshot.js';
import { formatUnits } from '@ethersproject/units';

const API_URL = 'https://api.covalenthq.com/v1/';
const API_KEY = 'ckey_2d082caf47f04a46947f4f212a8';
const ETHER_CONTRACT = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

export async function getTokenBalancesUsd(
  address: string
): Promise<any[] | null> {
  try {
    const url = `${API_URL}1/address/${address}/balances_v2/?quote-currency=USD&format=JSON&nft=false&no-nft-fetch=true&key=${API_KEY}`;
    const results = await snapshot.utils.getJSON(url);
    const etherItem = results.data.items.find(
      item => item.contract_address === ETHER_CONTRACT
    );
    return [
      etherItem,
      ...results.data.items.filter(
        item =>
          Number(formatUnits(item.balance || 0, item.contract_decimals || 0)) >
            0.001 && item.contract_address !== ETHER_CONTRACT
      )
    ];
  } catch (e) {
    console.error(e);
    return null;
  }
}
