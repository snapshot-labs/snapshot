<script setup lang="ts">
import { ExtendedSpace, SpaceValidation } from '@/helpers/interfaces';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { validateForm } from '@/helpers/validation';

const props = defineProps<{
  open: boolean;
  validation: SpaceValidation;
  filterMinScore: number;
  space?: ExtendedSpace;
}>();

const DEFAULT_PARAMS: Record<string, any> = {};

const emit = defineEmits(['add', 'close']);

const { open } = toRefs(props);

const isValidJson = ref(true);
const validations = ref<Validations | null>(null);
const isValidationsLoaded = ref(false);
const formRef = ref();
const updateIndex = ref(0);

const input = ref({
  name: '',
  params: clone(DEFAULT_PARAMS)
});

type Validations = Record<
  string,
  {
    key: string;
    example?: Record<string, any>[];
    schema?: Record<string, any>;
    about?: string;
    voteValidationOnly?: boolean;
  }
>;

const validationDefinition = computed(() => {
  return (
    validations.value?.[input.value.name]?.schema?.definitions?.Validation ||
    null
  );
});

const validationErrors = computed(() => {
  return validateForm(validationDefinition.value || {}, input.value.params);
});

const isValid = computed(() => {
  return Object.values(validationErrors.value).length === 0;
});

function handleSelect(n: string) {
  input.value.name = n;

  if (n === 'basic' && !input.value.params?.strategies?.length) {
    input.value.params = {
      minScore: input.value.params.minScore || props.filterMinScore || 1,
      strategies: [
        {
          name: 'ticket',
          network: '1',
          params: {
            symbol: 'DAI'
          }
        }
      ]
    };

    return;
  }

  if (props.validation.name !== n) {
    input.value.params = clone(DEFAULT_PARAMS);
  }

  if (n === 'any') {
    handleSubmit();
  }
}

function handleSubmit() {
  if (!isValid.value || !isValidJson.value)
    return formRef?.value?.forceShowError();

  emit('add', clone(input.value));
  emit('close');
}

function removeVoteValidationOnly(validations: Validations) {
  Object.keys(validations).forEach(key => {
    if (validations[key]?.voteValidationOnly) {
      delete validations[key];
    }
  });
}

async function getValidations() {
  if (validations.value) return;
  const fetchedValidations: Validations = await fetch(
    `${import.meta.env.VITE_SCORES_URL}/api/validations`
  ).then(res => res.json());
  const validationsWithAny: Validations = {
    any: {
      key: 'any'
    },
    ...fetchedValidations
  };

  removeVoteValidationOnly(validationsWithAny);

  validations.value = validationsWithAny || null;
  isValidationsLoaded.value = true;
}

function handleCopyStrategies() {
  updateIndex.value++;
  input.value.params.strategies = props.space?.strategies;
}

watch(open, () => {
  getValidations();
  input.value.name = '';
  if (props.validation?.params) {
    input.value.params = props.validation.params;
  } else {
    input.value = {
      name: '',
      params: clone(DEFAULT_PARAMS)
    };
  }
});
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <h3>
        {{
          input.name
            ? $t('proposalValidation.settingsTitle')
            : $t('proposalValidation.title')
        }}
      </h3>
    </template>

    <div class="mx-0 my-4 min-h-[250px] md:mx-4">
      <div v-if="input.name" class="mx-4 text-skin-link">
        <TuneForm
          v-if="validationDefinition"
          ref="formRef"
          :key="updateIndex"
          v-model="input.params"
          :definition="validationDefinition"
          :error="validationErrors"
        />
        <TuneTextareaJson
          v-else
          v-model="input.params"
          :placeholder="$t('proposalValidation.paramPlaceholder')"
          @update:is-valid="value => (isValidJson = value)"
        />
        <button
          v-if="space && input.name === 'basic'"
          class="flex items-center gap-1"
          @click="handleCopyStrategies"
        >
          <i-ho-duplicate />
          Copy voting strategies
        </button>
      </div>
      <div v-if="!input.name">
        <LoadingRow v-if="!isValidationsLoaded" block class="px-0" />
        <div v-else class="space-y-3">
          <BaseModalSelectItem
            v-for="v in validations"
            :key="v.key"
            :title="$t(`proposalValidation.${v.key}.label`)"
            :description="$t(`proposalValidation.${v.key}.description`)"
            :selected="validation.name === v.key"
            :tag="v.key === 'passport-gated' ? 'Beta' : ''"
            @click="handleSelect(v.key)"
          />
        </div>
      </div>
    </div>
    <template v-if="input.name" #footer>
      <BaseButton class="w-full" primary @click="handleSubmit">
        {{ $t('save') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
