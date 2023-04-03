<script setup lang="ts">
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { ExtendedSpace } from '@/helpers/interfaces';

const defaultNetwork = import.meta.env.VITE_DEFAULT_NETWORK;

const props = defineProps<{
  space: ExtendedSpace;
  action: 'vote' | 'create' | 'settings';
  isResponsive?: boolean;
}>();

const networkKey = computed(() =>
  props.action === 'settings' ? defaultNetwork : props.space.network
);
</script>

<template>
  <BaseMessageBlock level="warning" :is-responsive="isResponsive">
    {{
      $t('settings.gnosisWrongNetwork.base', {
        network: networks?.[networkKey]?.name,
        action: $t(`settings.gnosisWrongNetwork.${action}`)
      })
    }}
  </BaseMessageBlock>
</template>
