import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const preview = ref(false);
const userSelectedDateStart = ref(false);
const userSelectedDateEnd = ref(false);
const sourceProposalLoaded = ref(false);

const choices = ref<{ id: number; text: string }[]>([
  { id: 0, text: '' },
  { id: 1, text: '' }
]);

const form = ref({
  name: '',
  body: '',
  choices: [],
  start: parseInt((Date.now() / 1e3).toFixed()),
  end: 0,
  snapshot: '',
  metadata: { plugins: {} },
  type: 'single-choice'
});

export function useSpaceCreateForm(space) {
  const route = useRoute();

  const bodyLimit = 14400;

  const dateStart = computed(() => {
    return space?.voting?.delay
      ? parseInt((Date.now() / 1e3).toFixed()) + space.voting.delay
      : form.value.start;
  });

  const dateEnd = computed(() => {
    return space?.voting?.period
      ? dateStart.value + space.voting.period
      : userSelectedDateEnd.value
      ? form.value.end
      : dateStart.value + 259200;
  });

  const sourceProposal = computed(() => route.params.sourceProposal);

  return {
    preview,
    form,
    bodyLimit,
    choices,
    dateStart,
    dateEnd,
    userSelectedDateStart,
    userSelectedDateEnd,
    sourceProposal,
    sourceProposalLoaded
  };
}
