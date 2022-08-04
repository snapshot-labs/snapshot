<script setup lang="ts">
import { useIntl } from '@/composables/useIntl';
import { useSkinsFilter } from '@/composables/useSkinsFilter';

const { skinsSpacesCount } = useSkinsFilter();

const { formatCompactNumber } = useIntl();

defineProps<{
  skin: string;
}>();
</script>

<template>
  <BaseBlock class="cursor-pointer hover:border-skin-text">
    <BaseButton :class="['mb-2', skin]" primary>{{ skin }}</BaseButton>
    <div class="text-skin-text">
      {{ $tc('inSpaces', [formatCompactNumber(skinsSpacesCount[skin] ?? 0)]) }}
    </div>
  </BaseBlock>
</template>
