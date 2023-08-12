<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';
import schemas from '@snapshot-labs/snapshot.js/src/schemas';
import { validateForm } from '@/helpers/validation';

const props = defineProps<{
  space: ExtendedSpace;
  address: string;
  about?: string;
  statement?: string;
}>();

const emit = defineEmits(['reload']);

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
}

onMounted(() => {
  form.value = {
    about: props.about || '',
    statement: props.statement || ''
  };
});
</script>

<template>
  <TheLayout>
    <template #content-left>
      <div class="space-y-3">
        <TextareaAutosize
          v-model="form.about"
          title="About"
          :autosize="false"
          class="text-skin-link"
        />
        <TextareaAutosize
          v-model="form.statement"
          title="Statement"
          :autosize="false"
          :min-height="300"
          class="text-skin-link"
        />
      </div>
    </template>

    <template #sidebar-right>
      <BaseBlock>
        <div>Save changes</div>

        Lorem ipsum dolor sit amet consectetur, adipisicing elit.
        <BaseButton
          class="w-full"
          :loading="savingStatement"
          primary
          @click="handleClickSave"
        >
          Save changes
        </BaseButton>
      </BaseBlock>
    </template>
  </TheLayout>
</template>
