import { reactive } from 'vue';

const store = reactive({
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
  return { store };
}
