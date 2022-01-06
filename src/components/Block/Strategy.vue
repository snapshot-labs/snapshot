<script setup>
import { n } from '@/helpers/utils';

defineProps(['strategy']);
</script>

<template>
  <Block class="hover-border">
    <div class="flex items-baseline">
      <h3>
        {{ strategy.key }}
      </h3>
      <div class="ml-1">v{{ strategy.version }}</div>
    </div>
    <div class="text-color">
      <Icon name="github" class="mr-1" />
      {{ strategy.author }}
    </div>
    <div>{{ $tc('inSpaces', [n(strategy.spaces)]) }}</div>
  </Block>
</template>
