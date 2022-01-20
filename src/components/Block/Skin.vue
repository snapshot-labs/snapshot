<script setup>
import { useIntl } from '@/composables/useIntl';

const { formatCompactNumber } = useIntl();

defineProps(['skin']);
</script>

<template>
  <div :class="skin.key" class="bg-black rounded-none md:rounded-md">
    <Block>
      <UiButton class="mb-2" primary>{{ skin.key }}</UiButton>
      <div class="text-color">
        {{ $tc('inSpaces', [formatCompactNumber(skin.spaces)]) }}
      </div>
    </Block>
  </div>
</template>
