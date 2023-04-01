import { useStorage } from '@vueuse/core';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import schemas from '@snapshot-labs/snapshot.js/src/schemas';

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
    plugins: {}
  },
  type: 'single-choice'
};

const EMPTY_PROPOSAL_DRAFT = {
  name: '',
  body: '',
  choices: [
    { key: 0, text: '' },
    { key: 1, text: '' }
  ],
  isBodySet: false
};

const form = ref<ProposalForm>(clone(EMPTY_PROPOSAL));
const userSelectedDateStart = ref(false);
const userSelectedDateEnd = ref(false);
const sourceProposalLoaded = ref(false);

export function useFormSpaceProposal() {
  const route = useRoute();

  const formDraft = useStorage<{
    name: string;
    body: string;
    choices: { key: number; text: string }[];
    isBodySet: boolean;
  }>(`snapshot.proposal.${route.params.key}`, clone(EMPTY_PROPOSAL_DRAFT));

  const sourceProposal = computed(() => route.params.sourceProposal);

  function resetForm() {
    formDraft.value = clone(EMPTY_PROPOSAL_DRAFT);
    form.value = clone(EMPTY_PROPOSAL);
    sourceProposalLoaded.value = false;
    userSelectedDateEnd.value = false;
    userSelectedDateStart.value = false;
  }

  const { getValidationMessage } = useFormValidation(schemas.proposal, form);

  function getValidation(field: string): { message: string; push: boolean } {
    const message = getValidationMessage(field);
    return {
      message: message || '',
      push: false
    };
  }

  return {
    form,
    formDraft,
    userSelectedDateStart,
    userSelectedDateEnd,
    sourceProposalLoaded,
    sourceProposal,
    resetForm,
    getValidation
  };
}
