import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';

const preview = ref(false);
const userSelectedDateStart = ref(false);
const userSelectedDateEnd = ref(false);
const sourceProposalLoaded = ref(false);

const choices = ref<{ key: number; text: string }[]>([
  { key: 0, text: '' },
  { key: 1, text: '' }
]);

const defaultForm = {
  name: '',
  body: '',
  choices: [],
  start: 0,
  end: 0,
  snapshot: 0,
  metadata: { plugins: {} },
  type: 'single-choice'
};

const form = ref(clone(defaultForm));

export function useCreateProposal() {
  const route = useRoute();

  const bodyLimit = 14400;

  const sourceProposal = computed(() => route.params.sourceProposal);

  function updateDateStart(space) {
    space.voting?.delay
      ? parseInt((Date.now() / 1e3).toFixed()) + space.voting.delay
      : form.value.start;
  }

  function updateDateEnd(space) {
    form.value.end = space?.voting?.period
      ? form.value.start + space.voting.period
      : userSelectedDateEnd.value
      ? form.value.end
      : form.value.start + 259200;
  }

  return {
    preview,
    form,
    bodyLimit,
    choices,
    userSelectedDateStart,
    userSelectedDateEnd,
    sourceProposal,
    sourceProposalLoaded,
    defaultForm,
    updateDateStart,
    updateDateEnd
  };
}
