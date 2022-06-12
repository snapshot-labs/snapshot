<script setup lang="ts">
import { ref } from 'vue';
import schemas from '@snapshot-labs/snapshot.js/src/schemas';

defineProps<{
  domain?: string;
  skin?: string;
  getErrorMessage: (field: string) => string;
}>();

const emit = defineEmits(['update:domain', 'update:skin']);

const modalSkinsOpen = ref(false);
</script>

<template>
  <BaseBlock :title="$t('settings.customDomain')">
    <BaseMessage level="info" class="mb-4">
      <i18n-t keypath="settings.domain.info" tag="span">
        <template #docs>
          <BaseLink link="https://docs.snapshot.org/spaces/add-custom-domain">
            {{ $t('learnMore') }}
          </BaseLink>
        </template>
      </i18n-t>
    </BaseMessage>

    <ContainerParallelInput>
      <BaseInput
        :title="$t('settings.domain.label')"
        :model-value="domain"
        :error="getErrorMessage('domain')"
        :max-length="schemas.space.properties.domain.maxLength"
        placeholder="e.g. vote.balancer.fi"
        @update:model-value="emit('update:domain', $event)"
      />

      <InputSelect
        :title="$t(`settings.skin`)"
        :model-value="skin ? skin : $t('defaultSkin')"
        @select="modalSkinsOpen = true"
      />
    </ContainerParallelInput>

    <teleport to="#modal">
      <ModalSkins
        :model-value="skin"
        :open="modalSkinsOpen"
        @update:model-value="emit('update:skin', $event)"
        @close="modalSkinsOpen = false"
      />
    </teleport>
  </BaseBlock>
</template>
