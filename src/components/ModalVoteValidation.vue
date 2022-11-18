<script setup lang="ts">
import { ref, toRefs, watch, computed } from 'vue';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { VoteValidation } from '@/helpers/interfaces';

const DEFAULT_PARAMS: Record<string, any> = {};

const props = defineProps<{ open: boolean; validation: VoteValidation }>();

const emit = defineEmits(['add', 'close']);

const { open } = toRefs(props);

const isValid = ref(true);
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

async function getValidations() {
  const res = await fetch(`${import.meta.env.VITE_SCORES_URL}/api/validations`);
  const data = await res.json();
  validationSchemas.value = data || null;
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
  if (
    validationSchemas.value?.[input.value.name]?.schema?.definitions?.Validation
  )
    return validationSchemas.value[input.value.name].schema.definitions
      .Validation;
  return null;
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

    <div class="my-4 mx-0 min-h-[339px] md:mx-4">
      <div v-if="input.name" class="text-skin-link">
        <FormObject
          v-if="validationDefinition"
          v-model="input.params"
          :definition="validationDefinition"
        />
        <TextareaJson
          v-else
          v-model="input.params"
          v-model:is-valid="isValid"
          :placeholder="$t('settings.validationParameters')"
          class="input text-left"
        />
      </div>
      <div v-if="!input.name">
        <div class="space-y-3">
          <BaseModalSelectItem
            v-for="v in validations"
            :key="v"
            :title="$t(`validation.${v}.label`)"
            :description="$t(`validation.${v}.description`)"
            :selected="validation.name === v"
            @click="select(v)"
          />
        </div>
      </div>
    </div>
    <template v-if="input.name" #footer>
      <BaseButton
        :disabled="!isValid"
        class="w-full"
        primary
        @click="handleSubmit"
      >
        {{ $t('save') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
