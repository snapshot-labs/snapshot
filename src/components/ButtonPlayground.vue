<script setup lang="ts">
import { encodeJson } from '@/helpers/b64';

const props = withDefaults(
  defineProps<{
    name: string;
    network?: string;
    params?: any;
    snapshot?: string;
    big?: boolean;
  }>(),
  {
    name: '',
    network: '',
    params: {},
    snapshot: '',
    big: false
  }
);

const router = useRouter();
const { domain } = useApp();

function clickPlayground() {
  if (domain) {
    return window.open(
      `https://snapshot.org/#/playground/${props.name}?query=${encodeJson({
        params: props.params,
        network: props.network,
        snapshot: props.snapshot
      })}`,
      '_blank'
    );
  }
  const playgroundRoute = router.resolve({
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
  window.open(playgroundRoute.href, '_blank');
}
</script>

<template>
  <BaseButton v-if="big" class="w-full" @click="clickPlayground">
    {{ $t('settings.testInPlayground') }}
    <i-ho-external-link class="mb-[2px] inline-block text-xs" />
  </BaseButton>

  <BaseButtonIcon
    v-else
    v-tippy="{ content: $t('playground') }"
    @click="clickPlayground"
  >
    <i-ho-play />
  </BaseButtonIcon>
</template>
