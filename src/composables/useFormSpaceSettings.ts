import { ref, computed } from 'vue';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import schemas from '@snapshot-labs/snapshot.js/src/schemas';
import { useClient, useFormValidation, useImageUpload } from '@/composables';
import { ExtendedSpace } from '@/helpers/interfaces';
import isEqual from 'lodash/isEqual';

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
const showAllValidationErrors = ref(false);

export function useFormSpaceSettings(context: 'setup' | 'settings') {
  const form = computed({
    get: () => (context === 'setup' ? formSetup.value : formSettings.value),
    set: newVal =>
      context === 'setup'
        ? (formSetup.value = newVal)
        : (formSettings.value = newVal)
  });

  const hasFormChanged = computed(() => {
    console.log(
      'hasFormChanged:',
      !isEqual(formSettings.value, initialFormState.value)
    );
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

    if (formData.validation.name === 'basic' && !formData.filters.minScore)
      formData.validation.name = 'any';
    if (
      formData.validation.name === 'nouns' ||
      formData.validation.name === 'aave'
    )
      formData.validation.name = 'basic';

    form.value = clone(formData);
    initialFormState.value = clone(formData);
  }

  const { getValidationMessage, validationResult, isValid } = useFormValidation(
    schemas.space,
    computed(() => prunedForm.value)
  );

  function getValidation(field: string): { message: string; push: boolean } {
    const message = getValidationMessage(field);
    return {
      message: message || '',
      push: showAllValidationErrors.value
    };
  }

  const isReadyToSubmit = computed(
    () => !isUploadingImage.value && !isSending.value && isValid.value
  );

  function resetForm() {
    form.value = clone(initialFormState.value);
    showAllValidationErrors.value = false;
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

  return {
    form,
    prunedForm,
    validationResult,
    isValid,
    isReadyToSubmit,
    showAllValidationErrors,
    hasFormChanged,
    populateForm,
    getValidation,
    resetForm,
    setDefaultStrategy
  };
}
