<script setup lang="ts">
import { ref, toRefs, watch, computed } from 'vue';
import { VoteValidation } from '@/helpers/interfaces';
import { clone, validateSchema } from '@snapshot-labs/snapshot.js/src/utils';

const DEFAULT_PARAMS: Record<string, any> = {};

const props = defineProps<{ open: boolean; validation: VoteValidation }>();

const emit = defineEmits(['add', 'close']);

const { open } = toRefs(props);

const isValidJson = ref(true);

const input = ref({
  name: '',
  params: DEFAULT_PARAMS
});

const validations = ['any', 'passport-gated'];
const validationSchemas = ref(null);

function select(n: string) {
  input.value.name = n;
  if (n === 'any') {
    input.value.params = DEFAULT_PARAMS;
    handleSubmit();
  }
}

function handleSubmit() {
  emit('add', clone(input.value));
  emit('close');
}

const areValidationsLoaded = ref(false);

async function getValidations() {
  if (validationSchemas.value) return;
  const res = await fetch(`${import.meta.env.VITE_SCORES_URL}/api/validations`);
  const data = await res.json();
  validationSchemas.value = data || null;
  areValidationsLoaded.value = true;
}

watch(open, () => {
  getValidations();
  input.value.name = '';
  if (props.validation?.params) {
    input.value.params = props.validation.params;
  } else {
    input.value = {
      name: '',
      params: DEFAULT_PARAMS
    };
  }
});

const validationDefinition = computed(() => {
  return (
    validationSchemas.value?.[input.value.name]?.schema?.definitions
      ?.Validation || null
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
            ? $t('settings.editValidation')
            : $t('settings.selectValidation')
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
          :placeholder="$t('settings.validationParameters')"
          class="input text-left"
        />
      </div>
      <div v-if="!input.name">
        <LoadingRow v-if="!areValidationsLoaded" block class="px-0" />
        <div v-else class="space-y-3">
          <BaseModalSelectItem
            v-for="v in validations"
            :key="v"
            :title="$t(`validation.${v}.label`)"
            :description="$t(`validation.${v}.description`)"
            :selected="validation.name === v"
            :tag="v === 'passport-gated' ? 'Beta' : ''"
            @click="select(v)"
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
