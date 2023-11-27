import { isAddress } from '@ethersproject/address';
import { resolveHandle } from '@/helpers/utils';

export function useResolveName() {
  async function resolveName(value: string): Promise<string | null> {
    let address = value;

    if (isAddress(value)) {
      return address.toLowerCase();
    }

    address = await resolveHandle(value);

    return isAddress(address) ? address.toLowerCase() : null;
  }

  return {
    resolveName
  };
}
