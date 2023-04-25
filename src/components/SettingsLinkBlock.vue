<script setup lang="ts">
import schemas from '@snapshot-labs/snapshot.js/src/schemas';

const props = defineProps<{
  context: 'setup' | 'settings';
  isViewOnly?: boolean;
}>();

const { form, validationErrors, addRef } = useFormSpaceSettings(props.context);

type SocialIcon = 'twitter' | 'github' | 'coingecko';

const socialInputs: Array<{
  label: string;
  icon: SocialIcon;
  placeholder: string;
  key: string;
}> = [
  {
    label: 'Twitter',
    icon: 'twitter',
    placeholder: 'e.g. elonmusk',
    key: 'twitter'
  },
  {
    label: 'Github',
    icon: 'github',
    placeholder: 'e.g. vbuterin',
    key: 'github'
  },
  {
    label: 'CoinGecko',
    icon: 'coingecko',
    placeholder: 'e.g. uniswap',
    key: 'coingecko'
  }
];
</script>

<template>
  <BaseBlock :title="$t('settings.links')">
    <div class="space-y-3">
      <ContainerParallelInput>
        <TuneInputSocial
          v-for="item in socialInputs"
          :key="item.key"
          :ref="addRef"
          v-model="form[item.key]"
          :label="item.label"
          :error="validationErrors?.[item.key]"
          :max-length="schemas.space.properties[item.key].maxLength"
          :disabled="isViewOnly"
          :icon="item.icon"
          :placeholder="item.placeholder"
        />
      </ContainerParallelInput>
    </div>
  </BaseBlock>
</template>
