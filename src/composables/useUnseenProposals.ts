import { ref } from 'vue';
import { subgraphRequest } from '@snapshot-labs/snapshot.js/src/utils';
import { lsGet } from '@/helpers/utils';

const proposalIds = ref([]);
const lastSeenProposals = ref({});

/**
 * Fixme: This will not work if one of the followed spaces has more than 100 proposals created before
 * other spaces had proposals.
 */
export function useUnseenProposals() {
  async function getProposalIds(followingSpaces) {
    if (followingSpaces[0]) {
      try {
        const activeProposals = await subgraphRequest(
          `${import.meta.env.VITE_HUB_URL}/graphql`,
          {
            proposals: {
              __args: {
                first: 100,
                where: {
                  space_in: followingSpaces
                }
              },
              id: true,
              created: true,
              space: {
                id: true
              }
            }
          }
        );
        proposalIds.value = activeProposals.proposals;
      } catch (e) {
        console.log(e);
      }
    }
  }

  function updateLastSeenProposal(account) {
    if (account) {
      const walletId = account.slice(0, 8).toLowerCase();
      lastSeenProposals.value = lsGet(`lastSeenProposals.${walletId}`) || {};
    }
  }

  return {
    getProposalIds,
    updateLastSeenProposal,
    proposalIds,
    lastSeenProposals
  };
}
