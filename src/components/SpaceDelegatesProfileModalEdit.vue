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
const aboutRef = ref<any>(null);

const validationErrors = computed(() => {
  return validateForm(schemas.statement, form.value);
});

const isValid = computed(() => {
  return Object.values(validationErrors.value).length === 0;
});

async function handleClickSave() {
  if (!isValid.value) {
    aboutRef.value?.forceShowError();
    return;
  }
  try {
    await saveStatement(props.space.id, form.value.about, form.value.statement);
    emit('reload');
  } catch (e) {
    console.log(e);
  }
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
      <div class="space-y-3 px-4 md:px-0">
        <TuneTextarea
          ref="aboutRef"
          v-model="form.about"
          label="About"
          placeholder="Tell us about yourself"
          :max-length="schemas.statement.properties.about.maxLength"
          :error="validationErrors.about"
          class="min-h-[100px] text-skin-link"
        />
        <TuneTextarea
          v-model="form.statement"
          label="Statement"
          :max-length="schemas.statement.properties.statement.maxLength"
          :error="validationErrors.statement"
          placeholder="Why should people vote for you?"
          class="min-h-[220px] text-skin-link sm:min-h-[300px] lg:min-h-[400px]"
        />
      </div>
    </template>

    <template #sidebar-right>
      <BaseBlock class="mt-4 p-4 md:p-3 lg:mt-0" slim>
        <div class="font-semibold text-skin-heading">Save changes</div>

        You can always come back and edit your profile at any time.
        <BaseButton
          class="mt-3 w-full"
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
