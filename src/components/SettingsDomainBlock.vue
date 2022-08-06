<script setup lang="ts">
import { ref } from 'vue';
import schemas from '@snapshot-labs/snapshot.js/src/schemas';

import { useSpaceForm } from '@/composables';

const props = defineProps<{
  context: 'setup' | 'settings';
}>();

const { form, getValidation } = useSpaceForm(props.context);

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
      <BaseInput
        v-model="form.domain"
        :title="$t('settings.domain.label')"
        :error="getValidation('domain')"
        :max-length="schemas.space.properties.domain.maxLength"
        placeholder="e.g. vote.balancer.fi"
      />

      <InputSelect
        :title="$t(`settings.skin`)"
        :model-value="form.skin ? form.skin : $t('defaultSkin')"
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
