<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';
import schemas from '@snapshot-labs/snapshot.js/src/schemas';
import { validateForm } from '@/helpers/validation';

const props = defineProps<{
  open: boolean;
  space: ExtendedSpace;
  address: string;
  about?: string;
  statement?: string;
}>();

const emit = defineEmits(['close', 'reload']);

const { saveStatement, savingStatement } = useStatement();

const form = ref<any>({
  about: props.about || '',
  statement: props.statement || ''
});
const formRef = ref<any>(null);

const validationErrors = computed(() => {
  return validateForm(schemas.statement, form.value);
});

const isValid = computed(() => {
  return Object.values(validationErrors.value).length === 0;
});

async function handleClickSave() {
  if (!isValid.value) return;
  await saveStatement(props.space.id, form.value.about, form.value.statement);
  emit('reload');
  emit('close');
}

watch(
  () => props.open,
  async () => {
    if (props.open) {
      form.value = {
        about: props.about || '',
        statement: props.statement || ''
      };
    }
  }
);
</script>

<template>
  <BaseModal :open="open" @close="emit('close')">
    <template #header>
      <h3>Edit statement</h3>
    </template>

    <div class="space-y-2 p-4">
      <TuneForm
        ref="formRef"
        v-model="form"
        :definition="schemas.statement"
        :error="validationErrors || {}"
      />
    </div>

    <template #footer>
      <TuneButton
        class="w-full"
        :loading="savingStatement"
        primary
        @click="handleClickSave"
      >
        {{ $t('save') }}
      </TuneButton>
    </template>
  </BaseModal>
</template>
