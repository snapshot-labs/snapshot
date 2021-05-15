import { ref, computed } from 'vue';
import { subgraphRequest } from '@snapshot-labs/snapshot.js/src/utils';
import { lsGet } from '@/helpers/utils';

const proposalIds = ref([]);

export function useUnseenProposals() {
  async function getProposalIds(favorites) {
    const favoriteKeys = Object.keys(favorites);

    if (favoriteKeys[0]) {
      try {
        const activeProposals = await subgraphRequest(
          `${process.env.VUE_APP_HUB_URL}/graphql`,
          {
            proposals: {
              __args: {
                first: 100,
                where: {
                  space_in: favoriteKeys
                }
              },
              id: true
            }
          }
        );
        proposalIds.value = activeProposals.proposals;
      } catch (e) {
        console.log(e);
      }
    }
  }

  const numberOfUnseenProposals = computed(() => {
    const index = proposalIds.value
      .map((proposal: { id: string }) => proposal.id)
      .indexOf(lsGet('lastSeenProposalId', ''));
    const numberOfUnseen = index < 0 ? proposalIds.value.length : index;

    return numberOfUnseen > 99 ? '99+' : numberOfUnseen;
  });

  return { getProposalIds, numberOfUnseenProposals, proposalIds };
}
