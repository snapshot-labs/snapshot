import { BOOST_WHITELIST_SETTINGS, claimTokens } from '@/helpers/boost';
import { BoostSubgraph } from '@/helpers/boost/types';
import { Proposal, ExtendedSpace } from '@/helpers/interfaces';
import { TWO_WEEKS } from '@/helpers/constants';
import { getVouchers } from '@/helpers/boost/api';
import { toChecksumAddress } from '@/helpers/utils';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';

export function useBoost() {
  const auth = getInstance();
  const { env } = useApp();
  const { web3Account, web3 } = useWeb3();
  const { changeNetwork } = useChangeNetwork();

  const loadingClaim = ref(false);

  function isWhitelisted(spaceId: string) {
    return BOOST_WHITELIST_SETTINGS[env].includes(spaceId);
  }

  function sanitizeBoosts(
    boosts: BoostSubgraph[],
    proposals: Proposal[],
    space: ExtendedSpace
  ) {
    return boosts.filter(boost => {
      if (
        !space.boost.bribeEnabled &&
        boost.strategy.eligibility.type === 'bribe'
      ) {
        return false;
      }
      if (
        Number(boost.start) !==
        proposals.find(p => p.id === boost.strategy.proposal)?.end
      ) {
        return false;
      }
      if (Number(boost.end) - Number(boost.start) !== TWO_WEEKS) {
        return false;
      }
      return true;
    });
  }

  async function loadVouchers(boosts: BoostSubgraph[], proposalId: string) {
    try {
      const vouchers = await getVouchers(proposalId, web3Account.value, boosts);

      return vouchers;
    } catch (e) {
      console.error('Get vouchers error:', e);
    }
  }

  async function handleClaim(boost: BoostSubgraph, proposalId: string) {
    if (boost.chainId !== web3.value.network.chainId.toString()) {
      await changeNetwork(boost.chainId);
      handleClaim(boost, proposalId);
    }

    try {
      loadingClaim.value = true;
      const response = await loadVouchers([boost], proposalId);
      if (!response) throw new Error('Failed to get vouchers');

      const voucher = response[0];
      const signature = voucher.signature;
      const chainId = voucher.chain_id;
      const tx = await claimTokens(
        auth.web3,
        chainId,
        {
          boostId: voucher.boost_id,
          recipient: toChecksumAddress(web3Account.value),
          amount: voucher.reward
        },
        signature
      );
      await tx.wait();
    } catch (e: any) {
      console.error('Claim error:', e);
    } finally {
      loadingClaim.value = false;
    }
  }

  return {
    isWhitelisted,
    sanitizeBoosts,
    loadVouchers,
    handleClaim,
    loadingClaim
  };
}
