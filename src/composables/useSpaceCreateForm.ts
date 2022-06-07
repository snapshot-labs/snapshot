import { onMounted, ref, watch, computed } from 'vue';
import { useStorage } from '@vueuse/core';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { useRoute } from 'vue-router';

interface ProposalForm {
  name: string;
  body: string;
  discussion: string;
  choices: { key: number; text: string }[];
  start: number;
  end: number;
  snapshot: number;
  type: string;
  metadata: {
    strategies: {
      name: string;
      network: string;
      params: Record<string, unknown>;
    }[];
    network: string;
    plugins: {
      safeSnap?: { valid: boolean };
    };
  };
}

const EMPTY_PROPOSAL: ProposalForm = {
  name: '',
  body: '',
  discussion: '',
  choices: [
    { key: 0, text: '' },
    { key: 1, text: '' }
  ],
  start: parseInt((Date.now() / 1e3).toFixed()),
  end: 0,
  snapshot: 0,
  metadata: {
    strategies: [],
    network: '',
    plugins: {}
  },
  type: 'single-choice'
};

const form = ref<ProposalForm>(clone(EMPTY_PROPOSAL));
const userSelectedDateStart = ref(false);
const userSelectedDateEnd = ref(false);
const sourceProposalLoaded = ref(false);

export function useSpaceCreateForm() {
  const formDraft = useStorage(`snapshot.proposal`, clone(EMPTY_PROPOSAL));

  const route = useRoute();
  const sourceProposal = computed(() => route.params.sourceProposal);

  watch(
    form,
    () => {
      formDraft.value = form.value;
    },
    { immediate: true }
  );

  onMounted(() => {
    if (!sourceProposal.value) form.value = formDraft.value;
  });

  function resetForm() {
    form.value = clone(EMPTY_PROPOSAL);
    sourceProposalLoaded.value = false;
    userSelectedDateEnd.value = false;
    userSelectedDateStart.value = false;
  }

  return {
    form,
    userSelectedDateStart,
    userSelectedDateEnd,
    sourceProposalLoaded,
    sourceProposal,
    resetForm
  };
}
