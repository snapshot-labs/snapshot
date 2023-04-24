<script setup lang="ts">
import schemas from '@snapshot-labs/snapshot.js/src/schemas';

const props = defineProps<{
  context: 'setup' | 'settings';
  isViewOnly?: boolean;
}>();

const { form, getValidation } = useFormSpaceSettings(props.context);
</script>

<template>
  <BaseBlock :title="$t('settings.links')">
    <div class="space-y-3">
      <ContainerParallelInput>
        <InputSocial
          v-model="form.twitter"
          title="Twitter"
          :error="getValidation('twitter')"
          :max-length="schemas.space.properties.twitter.maxLength"
          :is-disabled="isViewOnly"
          icon="twitter"
          placeholder="e.g. elonmusk"
        />
        <InputSocial
          v-model="form.github"
          title="Github"
          :error="getValidation('github')"
          :max-length="schemas.space.properties.github.maxLength"
          :is-disabled="isViewOnly"
          icon="github"
          placeholder="e.g. vbuterin"
        />
        <InputSocial
          v-model="form.coingecko"
          title="CoinGecko"
          :error="getValidation('coingecko')"
          :max-length="schemas.space.properties.coingecko.maxLength"
          :is-disabled="isViewOnly"
          icon="coingecko"
          placeholder="e.g. uniswap"
        />
      </ContainerParallelInput>
    </div>
  </BaseBlock>
</template>
