<script setup>
import { n } from '@/helpers/utils';

defineProps(['validation']);
</script>

<template>
  <Block>
    <div class="flex items-center mb-1">
      <h3 v-text="validation.name" />
    </div>
    <div class="text-color">
      {{ $tc('inSpaces', [n(validation.spaces)]) }}
    </div>
  </Block>
</template>
