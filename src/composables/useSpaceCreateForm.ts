import { onMounted, ref, watch } from 'vue';
import { useStorage } from '@vueuse/core';

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

const form = ref(EMPTY_PROPOSAL);

export function useSpaceCreateForm() {
  const formDraft = useStorage(`snapshot.proposal`, EMPTY_PROPOSAL);

  watch(
    form,
    () => {
      formDraft.value = form.value;
    },
    { immediate: true }
  );

  onMounted(() => (form.value = formDraft.value));

  function resetForm() {
    form.value = EMPTY_PROPOSAL;
  }

  return { form, resetForm };
}
