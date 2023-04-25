import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import schemas from '@snapshot-labs/snapshot.js/src/schemas';
import { ExtendedSpace } from '@/helpers/interfaces';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import { validateForm } from '@/helpers/validation';

const { isSending } = useClient();
const { isUploadingImage } = useImageUpload();

const DEFAULT_PROPOSAL_VALIDATION = { name: 'any', params: {} };
const DEFAULT_VOTE_VALIDATION = { name: 'any', params: {} };
const EMPTY_SPACE_FORM = {
  strategies: [],
  categories: [],
  treasuries: [],
  admins: [],
  moderators: [],
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
    type: '',
    privacy: ''
  },
  validation: clone(DEFAULT_PROPOSAL_VALIDATION),
  voteValidation: clone(DEFAULT_VOTE_VALIDATION),
  name: '',
  about: '',
  avatar: '',
  network: '1',
  symbol: '',
  terms: '',
  website: '',
  twitter: '',
  github: '',
  coingecko: '',
  parent: null,
  children: [],
  private: false,
  domain: '',
  skin: '',
  guidelines: '',
  template: ''
};

const formSetup = ref(clone(EMPTY_SPACE_FORM));
const formSettings = ref(clone(EMPTY_SPACE_FORM));
const initialFormState = ref(clone(EMPTY_SPACE_FORM));
const inputRefs = ref<any[]>([]);

export function useFormSpaceSettings(context: 'setup' | 'settings') {
  const form = computed({
    get: () => (context === 'setup' ? formSetup.value : formSettings.value),
    set: newVal =>
      context === 'setup'
        ? (formSetup.value = newVal)
        : (formSettings.value = newVal)
  });

  const hasFormChanged = computed(() => {
    return !isEqual(formSettings.value, initialFormState.value);
  });

  const prunedForm = computed(() => {
    const formData = clone(form.value);
    Object.entries(formData).forEach(([key, value]) => {
      if (value === null || value === '') delete formData[key];
    });
    return formData;
  });

  function populateForm(extendedSpace: ExtendedSpace) {
    const formData = clone(extendedSpace);
    delete formData.id;
    delete formData.followersCount;

    if (formData.filters.invalids) delete formData.filters.invalids;

    formData.strategies = formData.strategies || [];
    formData.plugins = formData.plugins || {};
    formData.validation =
      formData.validation || clone(DEFAULT_PROPOSAL_VALIDATION);
    formData.voteValidation =
      formData.voteValidation || clone(DEFAULT_VOTE_VALIDATION);
    formData.filters = formData.filters || {};
    formData.voting = formData.voting || {};
    formData.voting.delay = formData.voting?.delay || undefined;
    formData.voting.period = formData.voting?.period || undefined;
    formData.voting.type = formData.voting?.type || undefined;
    formData.voting.quorum = formData.voting?.quorum || undefined;
    formData.voting.privacy = formData.voting?.privacy || undefined;
    formData.children = formData.children.map(child => child.id) || [];
    formData.parent = formData.parent?.id || '';

    if (
      formData.validation.name === 'basic' &&
      !formData.filters.minScore &&
      !formData.validation.params.minScore &&
      isEmpty(formData.validation.params)
    )
      formData.validation.name = 'any';
    if (
      formData.validation.name === 'nouns' ||
      formData.validation.name === 'aave'
    )
      formData.validation.name = 'basic';

    form.value = clone(formData);
    initialFormState.value = clone(formData);
  }

  const validationErrors = computed(() => {
    return validateForm(schemas.space, prunedForm.value);
  });

  const isValid = computed(() => {
    return Object.values(validationErrors.value).length === 0;
  });

  const isReadyToSubmit = computed(
    () => !isUploadingImage.value && !isSending.value
  );

  function resetForm() {
    form.value = clone(initialFormState.value);
  }

  function setDefaultStrategy() {
    form.value.strategies = [];
    form.value.strategies.push({
      name: 'ticket',
      network: '1',
      params: {
        symbol: 'VOTE'
      }
    });
    form.value.symbol = 'VOTE';
  }

  function forceShowError() {
    inputRefs?.value?.forEach((ref: any) => {
      if (ref?.forceShowError) ref?.forceShowError();
    });
  }

  function addRef(ref: any) {
    if (ref) inputRefs.value.push(ref);
  }

  return {
    form,
    prunedForm,
    validationErrors,
    isValid,
    isReadyToSubmit,
    hasFormChanged,
    populateForm,
    resetForm,
    setDefaultStrategy,
    addRef,
    forceShowError
  };
}
