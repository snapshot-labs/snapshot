<script setup>
import { n } from '@/helpers/utils';

defineProps(['skin']);
</script>

<template>
  <div :class="skin.key" class="bg-black rounded-none md:rounded-md">
    <Block>
      <UiButton class="mb-2" primary>{{ skin.key }}</UiButton>
      <div class="text-color">
        {{ $tc('inSpaces', [n(skin.spaces)]) }}
      </div>
    </Block>
  </div>
</template>
