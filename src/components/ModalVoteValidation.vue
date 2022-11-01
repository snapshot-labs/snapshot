<script setup lang="ts">
import { ref, toRefs, watch } from 'vue';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { VoteValidation } from '@/helpers/interfaces';

const DEFAULT_PARAMS = {};

const props = defineProps<{ open: boolean; validation: VoteValidation }>();

const emit = defineEmits(['add', 'close']);

const { open } = toRefs(props);

const isValid = ref(true);
const input = ref({
  name: '',
  params: DEFAULT_PARAMS
});

const validations = ['any', 'passport'];

function select(n: string) {
  input.value.name = n;
}

function handleSubmit() {
  emit('add', clone(input.value));
  emit('close');
}

watch(open, () => {
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
      <div v-if="input.name" class="mb-4 rounded-md border p-4 text-skin-link">
        <h4
          class="mb-3 text-center"
          v-text="$t(`validation.${input.name}.label`)"
        />
        <TextareaJson
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
