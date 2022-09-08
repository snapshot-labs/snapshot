<script setup lang="ts">
import { encodeJson } from '@/helpers/b64';
import { useRouter } from 'vue-router';

const props = withDefaults(
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

const emit = defineEmits(['close']);

const router = useRouter();

function clickPlayground() {
  emit('close');
  router.push({
    name: 'playground',
    query: {
      query: encodeJson({
        params: props.params,
        network: props.network,
        snapshot: props.snapshot
      })
    },
    params: { name: props.name }
  });
}
</script>

<template>
  <BaseButtonIcon
    v-tippy="{ content: $t('playground') }"
    @click="clickPlayground"
  >
    <i-ho-play />
  </BaseButtonIcon>
</template>
