<script setup>
import { useIntl } from '@/composables/useIntl';

const { formatCompactNumber } = useIntl();

defineProps(['strategy']);
</script>

<template>
  <BaseBlock class="cursor-pointer hover:border-skin-text">
    <div class="flex items-baseline">
      <h3 class="mt-0 truncate" v-tippy="{ content: strategy.id }">
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
