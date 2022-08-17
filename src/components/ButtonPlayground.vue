<script setup lang="ts">
import { encodeJson } from '@/helpers/b64';

withDefaults(
  defineProps<{
    name: string;
    network?: string;
    params?: any;
    snapshot?: string;
  }>(),
  {
    name: '',
    network: '',
    params: {},
    snapshot: ''
  }
);
</script>

<template>
  <BaseButtonIcon
    v-tippy="{ content: $t('playground') }"
    @click="
      $router.push({
        name: 'playground',
        query: {
          query: encodeJson({
            params,
            network,
            snapshot
          })
        },
        params: { name }
      })
    "
  >
    <i-ho-play />
  </BaseButtonIcon>
</template>
