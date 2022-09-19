<script setup lang="ts">
import { Strategy } from '@/helpers/interfaces';
import { useIntl } from '@/composables';

const { formatCompactNumber } = useIntl();

defineProps<{
  strategy: Strategy;
}>();
</script>

<template>
  <BaseBlock class="cursor-pointer hover:border-skin-text">
    <div class="flex items-baseline">
      <h3 v-tippy="{ content: strategy.id }" class="mt-0 truncate">
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
