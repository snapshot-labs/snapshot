import { reactive } from 'vue';
import { Proposal } from '@/helpers/interfaces';

interface ProposalsStore {
  space: {
    proposals: Proposal[];
    filterBy: string;
  };
  timeline: {
    proposals: Proposal[];
    filterBy: string;
  };
}

const store = reactive<ProposalsStore>({
  space: {
    proposals: [],
    filterBy: 'all'
  },
  timeline: {
    proposals: [],
    filterBy: 'all'
  }
});

export function useProposals() {
  function removeSpaceProposal(id: string) {
    store.space.proposals = store.space.proposals.filter(
      proposal => proposal.id !== id
    );
  }

  return { store, removeSpaceProposal };
}
