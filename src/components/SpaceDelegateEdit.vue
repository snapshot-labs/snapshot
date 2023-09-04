<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';
import schemas from '@snapshot-labs/snapshot.js/src/schemas';
import { validateForm } from '@/helpers/validation';

const props = defineProps<{
  space: ExtendedSpace;
  address: string;
  statement: {
    about: string;
    statement: string;
  };
  edited: boolean;
  saving: boolean;
}>();

const emit = defineEmits(['save', 'update:about', 'update:statement']);

const aboutRef = ref<any>(null);

const validationErrors = computed(() => {
  return validateForm(schemas.statement, props.statement);
});

const isValid = computed(() => {
  return Object.values(validationErrors.value).length === 0;
});

async function handleClickSave() {
  if (!isValid.value) {
    aboutRef.value?.forceShowError();
    return;
  }
  emit('save');
}
</script>

<template>
  <TheLayout>
    <template #content-left>
      <div class="space-y-3 px-4 md:px-0">
        <TuneTextarea
          ref="aboutRef"
          :model-value="statement.about"
          label="About"
          placeholder="Tell us about yourself"
          :max-length="schemas.statement.properties.about.maxLength"
          :error="validationErrors.about"
          class="min-h-[100px] text-skin-link"
          @update:model-value="emit('update:about', $event)"
        />
        <TuneTextarea
          :model-value="statement.statement"
          label="Statement"
          :max-length="schemas.statement.properties.statement.maxLength"
          :error="validationErrors.statement"
          placeholder="Why should people vote for you?"
          class="min-h-[220px] text-skin-link sm:min-h-[300px] lg:min-h-[400px]"
          @update:model-value="emit('update:statement', $event)"
        />
      </div>
    </template>

    <template #sidebar-right>
      <BaseBlock
        class="mt-4 hidden p-4 md:block md:p-3 lg:sticky lg:top-[110px] lg:mt-0 lg:w-[320px]"
        slim
      >
        <div class="font-semibold text-skin-heading">Save changes</div>

        You can always come back and edit your profile at any time.

        <TheActionbar break-point="md">
          <div class="px-4 md:px-0">
            <BaseButton
              class="mt-3 w-full"
              :loading="saving"
              :disabled="!edited"
              primary
              @click="handleClickSave"
            >
              Save changes
            </BaseButton>
          </div>
        </TheActionbar>
      </BaseBlock>
    </template>
  </TheLayout>
</template>
