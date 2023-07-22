<script setup lang="ts">
import { VoteValidation, SpaceStrategy } from '@/helpers/interfaces';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { validateForm } from '@/helpers/validation';

const DEFAULT_PARAMS: Record<string, any> = {};

const props = defineProps<{
  open: boolean;
  validation: VoteValidation;
  votingStrategies: SpaceStrategy[];
}>();

const emit = defineEmits(['add', 'close']);

const { open } = toRefs(props);
const { t } = useI18n();

const isValidParams = ref(true);
const formRef = ref();
const strategiesFormRef = ref();
const showStrategies = ref(false);

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
    proposalValidationOnly?: boolean;
  }
>;

const validations = ref<Validations | null>(null);
const isValidationsLoaded = ref(false);
const updateIndex = ref(0);

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

function select(n: string) {
  input.value.name = n;

  if (props.validation.name !== n) {
    input.value.params = clone(DEFAULT_PARAMS);
  }

  if (n === 'any') {
    handleSubmit();
  }

  if (n === 'basic') {
    if (input.value.params.strategies) {
      showStrategies.value = true;
    }
  }

  if (n === 'passport-gated' && !input.value.params.operator) {
    input.value.params.operator = 'OR';
  }
}

function handleSubmit() {
  if (!isValid.value || !isValidParams.value) {
    strategiesFormRef.value?.forceShowError();
    formRef?.value?.forceShowError();
    return;
  }

  emit('add', clone(input.value));
  emit('close');
}

function removeProposalValidationOnly(validations: Validations) {
  Object.keys(validations).forEach(key => {
    if (validations[key]?.proposalValidationOnly) {
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

  if (validationsWithAny.basic.schema)
    validationsWithAny.basic.schema.definitions.Validation.properties.minScore.description =
      t('votingValidation.basic.minScoreHint');

  removeProposalValidationOnly(validationsWithAny);

  validations.value = validationsWithAny || null;
  isValidationsLoaded.value = true;
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

watch(showStrategies, () => {
  if (!showStrategies.value) {
    delete input.value.params.strategies;
    isValidParams.value = true;
  }
});
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <h3>
        {{
          input.name
            ? $t('votingValidation.settingsTitle')
            : $t('votingValidation.title')
        }}
      </h3>
    </template>

    <div class="mx-0 my-4 min-h-[250px] md:mx-4">
      <div v-if="input.name" class="mx-4 text-skin-link md:mx-0">
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
          :placeholder="$t('votingValidation.paramPlaceholder')"
          @update:is-valid="value => (isValidParams = value)"
        />

        <TuneSwitch
          v-if="input.name === 'basic'"
          v-model="showStrategies"
          :label="$t('useCustomStrategies')"
          :hint="$t('votingValidation.basic.customStrategiesHint')"
        />

        <FormArrayStrategies
          v-if="input.name === 'basic' && showStrategies"
          ref="strategiesFormRef"
          v-model="input.params.strategies"
          :voting-strategies="votingStrategies"
          @update:is-valid="value => (isValidParams = value)"
        />
      </div>
      <div v-if="!input.name">
        <LoadingRow v-if="!isValidationsLoaded" block class="px-0" />
        <div v-else class="space-y-3">
          <BaseModalSelectItem
            v-for="v in validations"
            :key="v.key"
            :title="$t(`votingValidation.${v.key}.label`)"
            :description="$t(`votingValidation.${v.key}.description`)"
            :selected="validation.name === v.key"
            :tag="v.key === 'passport-gated' ? 'Beta' : ''"
            @click="select(v.key)"
          />
        </div>
      </div>
    </div>
    <template v-if="input.name" #footer>
      <BaseButton class="w-full" primary @click="handleSubmit">
        {{ $t('applyChanges') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
