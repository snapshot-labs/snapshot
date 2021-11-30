import { ref } from 'vue';

const spaceProposals = ref([]);
const timelineProposals = ref([]);

export function useState() {
  return { spaceProposals, timelineProposals };
}
