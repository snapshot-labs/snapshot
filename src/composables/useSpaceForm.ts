import { ref, computed } from 'vue';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import schemas from '@snapshot-labs/snapshot.js/src/schemas';
import { useClient, useFormValidation, useImageUpload } from '@/composables';
import { ExtendedSpace } from '@/helpers/interfaces';

const { isSending } = useClient();
const { isUploadingImage } = useImageUpload();

const BASIC_VALIDATION = { name: 'basic', params: {} };
const EMPTY_SPACE_FORM = {
  strategies: [],
  categories: [],
  treasuries: [],
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
  validation: BASIC_VALIDATION,
  name: '',
  about: '',
  avatar: '',
  network: '1',
  symbol: '',
  terms: '',
  website: '',
  twitter: '',
  github: '',
  parent: null,
  children: [],
  private: false,
  domain: '',
  skin: ''
};

const formSetup = ref(clone(EMPTY_SPACE_FORM));
const formSettings = ref(clone(EMPTY_SPACE_FORM));
const initialFormState = ref(clone(EMPTY_SPACE_FORM));
const showAllValidationErrors = ref(false);

export function useSpaceForm(context: 'setup' | 'settings') {
  const form = computed({
    get: () => (context === 'setup' ? formSetup.value : formSettings.value),
    set: newVal =>
      context === 'setup'
        ? (formSetup.value = newVal)
        : (formSettings.value = newVal)
  });

  function populateForm(extendedSpace: ExtendedSpace) {
    const formData = clone(extendedSpace);
    delete formData.id;
    delete formData.followersCount;

    if (formData.filters.invalids) delete formData.filters.invalids;

    formData.strategies = formData.strategies || [];
    formData.plugins = formData.plugins || {};
    formData.validation = formData.validation || BASIC_VALIDATION;
    formData.filters = formData.filters || {};
    formData.voting = formData.voting || {};
    formData.voting.delay = formData.voting?.delay || undefined;
    formData.voting.period = formData.voting?.period || undefined;
    formData.voting.type = formData.voting?.type || undefined;
    formData.voting.quorum = formData.voting?.quorum || undefined;
    formData.children = formData.children.map(child => child.id) || [];
    formData.parent = formData.parent?.id || '';

    form.value = formData;
    initialFormState.value = clone(formData);
  }

  function pruneForm(formData) {
    Object.entries(formData).forEach(([key, value]) => {
      if (value === null || value === '') delete formData[key];
    });
    return formData;
  }

  const { getValidationMessage, validationResult, isValid } = useFormValidation(
    schemas.space,
    computed(() => pruneForm(form.value))
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
    validationResult,
    isValid,
    isReadyToSubmit,
    showAllValidationErrors,
    populateForm,
    getValidation,
    resetForm,
    setDefaultStrategy
  };
}
