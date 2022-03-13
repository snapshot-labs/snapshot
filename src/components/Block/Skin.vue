<script setup>
import { useIntl } from '@/composables/useIntl';
import { useSkinsFilter } from '@/composables/useSkinsFilter';

const { skinsSpacesCount } = useSkinsFilter();

const { formatCompactNumber } = useIntl();

defineProps(['skin']);
</script>

<template>
  <Block class="hover:border-skin-text cursor-pointer">
    <UiButton :class="['mb-2', skin]" primary>{{ skin }}</UiButton>
    <div class="text-skin-text">
      {{ $tc('inSpaces', [formatCompactNumber(skinsSpacesCount[skin] ?? 0)]) }}
    </div>
  </Block>
</template>
