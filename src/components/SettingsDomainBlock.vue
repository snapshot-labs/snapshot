<script setup lang="ts">
import schemas from '@snapshot-labs/snapshot.js/src/schemas';

const props = defineProps<{
  context: 'setup' | 'settings';
  isViewOnly?: boolean;
}>();

const { form, validationErrors } = useFormSpaceSettings(props.context);

const modalSkinsOpen = ref(false);
</script>

<template>
  <BaseBlock :title="$t('settings.customDomain')">
    <BaseMessageBlock level="info" class="mb-4">
      <i18n-t keypath="settings.domain.info" tag="span" scope="global">
        <template #docs>
          <BaseLink link="https://docs.snapshot.org/spaces/add-custom-domain">
            {{ $t('learnMore') }}
          </BaseLink>
        </template>
      </i18n-t>
    </BaseMessageBlock>

    <ContainerParallelInput>
      <TuneInput
        v-model="form.domain"
        :label="$t('settings.domain.label')"
        :error="validationErrors?.domain"
        :max-length="schemas.space.properties.domain.maxLength"
        :disabled="isViewOnly"
        placeholder="e.g. vote.balancer.fi"
      />

      <TuneButtonSelect
        :label="$t(`settings.skin`)"
        :model-value="form.skin ? form.skin : $t('defaultSkin')"
        :disabled="isViewOnly"
        @select="modalSkinsOpen = true"
      />
    </ContainerParallelInput>

    <teleport to="#modal">
      <ModalSkins
        v-model="form.skin"
        :open="modalSkinsOpen"
        @close="modalSkinsOpen = false"
      />
    </teleport>
  </BaseBlock>
</template>
