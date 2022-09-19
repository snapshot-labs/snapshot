import { ref, watch } from 'vue';
import { subgraphRequest } from '@snapshot-labs/snapshot.js/src/utils';
import { useFollowSpace, useWeb3 } from '@/composables';
import { useStorage } from '@vueuse/core';

type proposal = { id: string; created: number; space: { id: string } };

const proposals = ref<proposal[]>([]);

const lastSeenProposals = useStorage('lastSeenProposals', {});

export function useUnseenProposals() {
  const { followingSpaces } = useFollowSpace();

  async function getProposals() {
    if (followingSpaces.value.length === 0) return;
    try {
      const activeProposals = await subgraphRequest(
        `${import.meta.env.VITE_HUB_URL}/graphql`,
        {
          proposals: {
            __args: {
              first: 200,
              where: {
                space_in: followingSpaces.value
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
      proposals.value = activeProposals.proposals;
    } catch (e) {
      console.log(e);
    }
  }

  watch(followingSpaces, getProposals);

  const { web3Account } = useWeb3();

  function emitUpdateLastSeenProposal(spaceId: string) {
    if (!web3Account.value || !spaceId) return;
    lastSeenProposals.value[web3Account.value] =
      lastSeenProposals.value[web3Account.value] || {};
    lastSeenProposals.value[web3Account.value][spaceId] = new Date().getTime();
  }

  function spaceHasUnseenProposals(spaceId: string) {
    return proposals.value.some(p => {
      return (
        p.space.id === spaceId &&
        p.created >
          (lastSeenProposals.value?.[web3Account.value]?.[spaceId] || 0)
      );
    });
  }

  return {
    proposals,
    spaceHasUnseenProposals,
    emitUpdateLastSeenProposal
  };
}
