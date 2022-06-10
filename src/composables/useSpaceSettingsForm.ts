import { ref, computed } from 'vue';
import { clone, validateSchema } from '@snapshot-labs/snapshot.js/src/utils';
import schemas from '@snapshot-labs/snapshot.js/src/schemas';
import { useValidationErrors } from '@/composables/useValidationErrors';

const SPACE_OBJECT = {
  strategies: [],
  categories: [],
  admins: [],
  members: [],
  plugins: {},
  filters: {
    minScore: 0,
    onlyMembers: false
  },
  voting: {
    delay: 0,
    hideAbstain: false,
    period: 0,
    quorum: 0,
    type: ''
  },
  validation: { name: 'basic', params: {} },
  name: '',
  about: '',
  avatar: '',
  network: '',
  symbol: '',
  terms: '',
  website: '',
  twitter: '',
  github: '',
  private: false,
  domain: '',
  skin: ''
};
const BASIC_VALIDATION = { name: 'basic', params: {} };

const form = ref(clone(SPACE_OBJECT));

export function useSpaceSettingsForm() {
  function formatSpace(spaceRaw) {
    if (!spaceRaw) return;
    const space = clone(spaceRaw);
    if (!space) return;
    delete space.id;
    delete space.followersCount;
    if (form.value.filters.invalids) delete form.value.filters.invalids;
    Object.entries(space).forEach(([key, value]) => {
      if (value === null || value === '') delete space[key];
    });
    space.strategies = space.strategies || [];
    space.plugins = space.plugins || {};
    space.validation = space.validation || BASIC_VALIDATION;
    space.filters = space.filters || {};
    space.voting = space.voting || {};
    space.voting.delay = space.voting?.delay || undefined;
    space.voting.period = space.voting?.period || undefined;
    space.voting.type = space.voting?.type || undefined;
    space.voting.quorum = space.voting?.quorum || undefined;
    return space;
  }

  const validate = computed(() => {
    const formattedForm = formatSpace(form.value);

    return validateSchema(schemas.space, formattedForm);
  });

  const { validationErrorMessage } = useValidationErrors();

  function getErrorMessage(field) {
    return validationErrorMessage(field, validate.value);
  }

  function resetForm() {
    form.value = clone(SPACE_OBJECT);
  }

  return {
    form,
    validate,
    formatSpace,
    getErrorMessage,
    resetForm
  };
}
