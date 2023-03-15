<script setup lang="ts">
import { ref, toRefs, watch, computed } from 'vue';
import { SpaceValidation } from '@/helpers/interfaces';
import { clone, validateSchema } from '@snapshot-labs/snapshot.js/src/utils';

const props = defineProps<{
  open: boolean;
  validation: SpaceValidation;
  filterMinScore: number;
}>();

const DEFAULT_PARAMS: Record<string, any> = {};

const emit = defineEmits(['add', 'close']);

const { open } = toRefs(props);

const isValidJson = ref(true);

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
  }
>;

const validations = ref<Validations | null>(null);
const isValidationsLoaded = ref(false);

function handleSelect(n: string) {
  input.value.name = n;

  if (n === 'basic' && Object.keys(input.value.params).length === 0) {
    input.value.params = {
      minScore: 1,
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

    if (props.filterMinScore) {
      input.value.params = {
        minScore: props.filterMinScore
      };
    }

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
  emit('add', clone(input.value));
  emit('close');
}

async function getValidations() {
  if (validations.value) return;
  const fetchedValidations: Validations = await fetch(
    `${import.meta.env.VITE_SCORES_URL}/api/validations`
  ).then(res => res.json());
  const validationsWithAny = {
    any: {
      key: 'any'
    },
    ...fetchedValidations
  };
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

const validationDefinition = computed(() => {
  return (
    validations.value?.[input.value.name]?.schema?.definitions?.Validation ||
    null
  );
});

const isValidForm = computed(() => {
  if (!validationDefinition.value) return true;
  return (
    validateSchema(validationDefinition.value, input.value.params) === true
  );
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

    <div class="my-4 mx-0 min-h-[250px] md:mx-4">
      <div v-if="input.name" class="text-skin-link">
        <FormObject
          v-if="validationDefinition"
          v-model="input.params"
          :definition="validationDefinition"
        />
        <TextareaJson
          v-else
          v-model="input.params"
          v-model:is-valid="isValidJson"
          :placeholder="$t('proposalValidation.paramPlaceholder')"
          class="input text-left"
        />
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
      <BaseButton
        :disabled="!isValidJson || !isValidForm"
        class="w-full"
        primary
        @click="handleSubmit"
      >
        {{ $t('save') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
