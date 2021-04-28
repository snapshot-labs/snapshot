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
            timeline: {
              __args: {
                first: 100,
                spaces: favoriteKeys,
                state: 'all'
              },
              id: true
            }
          }
        );
        proposalIds.value = activeProposals.timeline;
      } catch (e) {
        console.log(e);
      }
    }
  }

  const numberOfUnseenProposals = computed(() => {
    const index = proposalIds.value
      .map((proposal: { id: string }) => proposal.id)
      .indexOf(lsGet('lastSeenProposalId', ''));
    return index < 0 ? proposalIds.value.length : index;
  });

  return { getProposalIds, numberOfUnseenProposals, proposalIds };
}
