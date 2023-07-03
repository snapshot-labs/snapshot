import { shorten } from '@/helpers/utils';
import { Profile } from '@/helpers/interfaces';

export function useUsername() {
  const { web3Account } = useWeb3();

  function getUsername(address: string, profile?: Profile) {
    if (
      web3Account &&
      address.toLowerCase() === web3Account.value.toLowerCase()
    ) {
      return 'You';
    }

    if (profile?.name) return profile.name;
    if (profile?.ens) return profile.ens;
    return shorten(address);
  }

  return { getUsername };
}
