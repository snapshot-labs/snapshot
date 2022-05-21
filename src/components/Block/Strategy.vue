<script setup>
import { useIntl } from '@/composables/useIntl';

const { formatCompactNumber } = useIntl();

defineProps(['strategy']);
</script>

<template>
  <BaseBlock class="hover:border-skin-text cursor-pointer">
    <div class="flex items-baseline">
      <h3 class="truncate mt-0" v-tippy="{ content: strategy.id }">
        {{ strategy.id }}
      </h3>
      <div class="ml-1">v{{ strategy.version }}</div>
    </div>
    <div class="text-skin-text">
      <BaseIcon name="github" class="mr-1" />
      {{ strategy.author }}
    </div>
    <div>
      {{ $tc('inSpaces', [formatCompactNumber(strategy.spacesCount)]) }}
    </div>
  </BaseBlock>
</template>
