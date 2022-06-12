<script setup lang="ts">
import schemas from '@snapshot-labs/snapshot.js/src/schemas';

defineProps<{
  twitter?: string;
  github?: string;
  website?: string;
  getErrorMessage: (field: string) => string;
}>();

const emit = defineEmits(['update:twitter', 'update:github', 'update:website']);
</script>

<template>
  <BaseBlock :title="$t('settings.links')">
    <div class="space-y-2">
      <ContainerParallelInput>
        <InputSocial
          title="Twitter"
          :model-value="twitter"
          :error="getErrorMessage('twitter')"
          :max-length="schemas.space.properties.twitter.maxLength"
          icon="twitter"
          placeholder="e.g. elonmusk"
          @update:model-value="value => emit('update:twitter', value)"
        />
        <InputSocial
          title="Github"
          :model-value="github"
          :error="getErrorMessage('github')"
          :max-length="schemas.space.properties.github.maxLength"
          icon="github"
          placeholder="e.g. vbuterin"
          @update:model-value="value => emit('update:github', value)"
        />
      </ContainerParallelInput>

      <InputUrl
        :title="$t('settings.website')"
        :model-value="website"
        :error="getErrorMessage('website')"
        :max-length="schemas.space.properties.website.maxLength"
        placeholder="www.example.com"
        @update:model-value="value => emit('update:website', value)"
      />
    </div>
  </BaseBlock>
</template>
