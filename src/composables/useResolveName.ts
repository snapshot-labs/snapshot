import { isAddress } from '@ethersproject/address';
import { resolveEns, resolveLens } from '@/helpers/utils';

export function useResolveName() {
  const { isValidEnsDomain } = useEns();

  async function resolveName(value: string): Promise<string | null> {
    let address = value;

    if (isAddress(value)) {
      return address.toLowerCase();
    }

    if (isValidEnsDomain(value)) {
      address = await resolveEns(value);
    } else if (value?.endsWith('.lens')) {
      address = await resolveLens(value);
    }

    return isAddress(address) ? address.toLowerCase() : null;
  }

  return {
    resolveName
  };
}
