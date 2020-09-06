import { formatUnits } from '@ethersproject/units';
import { multicall } from '../../utils';
import { abi } from './DSChief.json';

const MAKER_DS_CHIEF_ADDRESS = '0x9eF05f7F6deB616fd37aC3c959a2dDD25A54E4F5';

export async function strategy(provider, addresses, options, snapshot) {
  const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
  const response = await multicall(
    provider,
    abi,
    addresses.map((address: any) => [
      MAKER_DS_CHIEF_ADDRESS,
      'deposits',
      [address]
    ]),
    { blockTag }
  );
  return Object.fromEntries(
    response.map((value, i) => [
      addresses[i],
      parseFloat(formatUnits(value.toString(), options.decimals))
    ])
  );
}
