import { ref } from 'vue';

const spaceProposals = ref([]);
const timelineProposals = ref([]);

export function useStore() {
  return { spaceProposals, timelineProposals };
}
